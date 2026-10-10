package com.examhub.service.impl;

import com.examhub.dto.*;
import com.examhub.entity.*;
import com.examhub.exception.BadRequestException;
import com.examhub.exception.ConflictException;
import com.examhub.exception.ResourceNotFoundException;
import com.examhub.repository.*;
import com.examhub.service.SeatAllocationService;
import com.examhub.service.strategy.AllocationStrategy;
import com.examhub.service.strategy.StudentSeatPair;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class SeatAllocationServiceImpl implements SeatAllocationService {

    private final ExamRepository examRepository;
    private final StudentRepository studentRepository;
    private final ExamRegistrationRepository registrationRepository;
    private final ExamHallRepository hallRepository;
    private final SeatRepository seatRepository;
    private final SeatAllocationRepository allocationRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final Map<AllocationStrategyType, AllocationStrategy> strategyMap;

    public SeatAllocationServiceImpl(
            ExamRepository examRepository,
            StudentRepository studentRepository,
            ExamRegistrationRepository registrationRepository,
            ExamHallRepository hallRepository,
            SeatRepository seatRepository,
            SeatAllocationRepository allocationRepository,
            NotificationRepository notificationRepository,
            AuditLogRepository auditLogRepository,
            List<AllocationStrategy> strategies
    ) {
        this.examRepository = examRepository;
        this.studentRepository = studentRepository;
        this.registrationRepository = registrationRepository;
        this.hallRepository = hallRepository;
        this.seatRepository = seatRepository;
        this.allocationRepository = allocationRepository;
        this.notificationRepository = notificationRepository;
        this.auditLogRepository = auditLogRepository;
        this.strategyMap = strategies.stream()
                .collect(Collectors.toMap(AllocationStrategy::getType, s -> s));
    }

    @Override
    @Transactional
    public AllocationResponse generateAllocation(GenerateAllocationRequest request) {
        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + request.getExamId()));

        if (exam.getStatus() == ExamStatus.PUBLISHED) {
            throw new ConflictException("Allocation cannot be modified after publication.");
        }
        if (exam.getStatus() == ExamStatus.COMPLETED || exam.getStatus() == ExamStatus.CANCELLED) {
            throw new ConflictException("Cannot allocate seats for exam with status: " + exam.getStatus());
        }

        // 1. Fetch eligible registered students
        List<ExamRegistration> registrations = registrationRepository.findAllByExamId(request.getExamId());
        List<Student> students = registrations.stream()
                .map(ExamRegistration::getStudent)
                .filter(Student::isActive)
                .collect(Collectors.toList());

        if (students.isEmpty()) {
            throw new BadRequestException("No active registered students found for exam ID " + request.getExamId());
        }

        // 2. Fetch selected active halls and check schedule conflict
        List<ExamHall> halls = validateAndFetchHalls(request.getHallIds(), exam);

        // 3. Fetch all active seats for the selected halls
        List<Seat> availableSeats = new ArrayList<>();
        for (ExamHall hall : halls) {
            List<Seat> hallSeats = seatRepository.findAllByHallIdAndActiveTrueOrderByRowNumberAscColumnNumberAsc(hall.getId());
            availableSeats.addAll(hallSeats);
        }

        // 4. Capacity validation (Fail atomically if students > seats)
        if (students.size() > availableSeats.size()) {
            throw new ConflictException("Insufficient examination hall capacity. Registered students: " +
                    students.size() + ", Available seats: " + availableSeats.size());
        }

        // 5. Select and execute strategy
        AllocationStrategy strategy = strategyMap.get(request.getStrategy());
        if (strategy == null) {
            throw new BadRequestException("Unsupported allocation strategy: " + request.getStrategy());
        }

        List<StudentSeatPair> pairs = strategy.allocate(students, availableSeats, request.getRandomSeed());

        // 6. Persist allocations transactionally
        allocationRepository.deleteAllByExamId(exam.getId());

        List<SeatAllocation> allocationsToSave = new ArrayList<>();
        for (StudentSeatPair pair : pairs) {
            String allocNumber = "EX" + exam.getId() + "-H" + pair.getSeat().getHall().getId() +
                    "-" + pair.getSeat().getSeatNumber() + "-" + pair.getStudent().getRollNumber();

            SeatAllocation sa = SeatAllocation.builder()
                    .exam(exam)
                    .student(pair.getStudent())
                    .hall(pair.getSeat().getHall())
                    .seat(pair.getSeat())
                    .allocationNumber(allocNumber)
                    .status(AllocationStatus.ALLOCATED)
                    .build();
            allocationsToSave.add(sa);
        }

        allocationRepository.saveAll(allocationsToSave);

        // Update exam status
        exam.setStatus(ExamStatus.ALLOCATION_GENERATED);
        examRepository.save(exam);

        // Compute metrics
        AllocationMetricsDto metrics = calculateMetrics(students, availableSeats, allocationsToSave, halls);

        // Record audit log
        auditLogRepository.save(AuditLog.builder()
                .action("ALLOCATION_GENERATED")
                .entityType("EXAM")
                .entityId(exam.getId().toString())
                .details("Generated " + allocationsToSave.size() + " allocations using " + request.getStrategy() +
                        (request.getRandomSeed() != null ? " with seed " + request.getRandomSeed() : ""))
                .build());

        return AllocationResponse.builder()
                .examId(exam.getId())
                .studentsAllocated(allocationsToSave.size())
                .hallsUsed(halls.size())
                .seatsUsed(allocationsToSave.size())
                .strategy(request.getStrategy())
                .status("SUCCESS")
                .message("Allocation generated successfully")
                .metrics(metrics)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AllocationPreviewDto previewAllocation(GenerateAllocationRequest request) {
        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + request.getExamId()));

        List<ExamRegistration> registrations = registrationRepository.findAllByExamId(request.getExamId());
        List<Student> students = registrations.stream()
                .map(ExamRegistration::getStudent)
                .filter(Student::isActive)
                .collect(Collectors.toList());

        if (students.isEmpty()) {
            throw new BadRequestException("No active registered students found for exam ID " + request.getExamId());
        }

        List<ExamHall> halls = validateAndFetchHalls(request.getHallIds(), exam);

        List<Seat> availableSeats = new ArrayList<>();
        for (ExamHall hall : halls) {
            List<Seat> hallSeats = seatRepository.findAllByHallIdAndActiveTrueOrderByRowNumberAscColumnNumberAsc(hall.getId());
            availableSeats.addAll(hallSeats);
        }

        if (students.size() > availableSeats.size()) {
            throw new ConflictException("Insufficient examination hall capacity. Registered students: " +
                    students.size() + ", Available seats: " + availableSeats.size());
        }

        AllocationStrategy strategy = strategyMap.get(request.getStrategy());
        if (strategy == null) {
            throw new BadRequestException("Unsupported allocation strategy: " + request.getStrategy());
        }

        List<StudentSeatPair> pairs = strategy.allocate(students, availableSeats, request.getRandomSeed());

        Map<String, Integer> hallBreakdown = new LinkedHashMap<>();
        List<SeatAllocationDto> previewList = new ArrayList<>();

        for (StudentSeatPair pair : pairs) {
            String hallName = pair.getSeat().getHall().getHallName();
            hallBreakdown.put(hallName, hallBreakdown.getOrDefault(hallName, 0) + 1);

            SeatAllocationDto dto = SeatAllocationDto.builder()
                    .examId(exam.getId())
                    .subjectName(exam.getSubject().getName())
                    .subjectCode(exam.getSubject().getCode())
                    .studentId(pair.getStudent().getId())
                    .studentName(pair.getStudent().getName())
                    .rollNumber(pair.getStudent().getRollNumber())
                    .registrationNumber(pair.getStudent().getRegistrationNumber())
                    .departmentName(pair.getStudent().getDepartment().getName())
                    .departmentCode(pair.getStudent().getDepartment().getCode())
                    .section(pair.getStudent().getSection())
                    .hallId(pair.getSeat().getHall().getId())
                    .hallName(pair.getSeat().getHall().getHallName())
                    .building(pair.getSeat().getHall().getBuilding())
                    .floor(pair.getSeat().getHall().getFloor())
                    .roomNumber(pair.getSeat().getHall().getRoomNumber())
                    .seatId(pair.getSeat().getId())
                    .seatNumber(pair.getSeat().getSeatNumber())
                    .rowNumber(pair.getSeat().getRowNumber())
                    .columnNumber(pair.getSeat().getColumnNumber())
                    .allocationNumber("PREVIEW-" + pair.getSeat().getSeatNumber() + "-" + pair.getStudent().getRollNumber())
                    .status(AllocationStatus.ALLOCATED)
                    .build();
            previewList.add(dto);
        }

        AllocationMetricsDto metrics = calculateMetricsForPairs(students, availableSeats, pairs, halls);

        return AllocationPreviewDto.builder()
                .examId(exam.getId())
                .subjectName(exam.getSubject().getName())
                .subjectCode(exam.getSubject().getCode())
                .examDate(exam.getExamDate())
                .startTime(exam.getStartTime())
                .endTime(exam.getEndTime())
                .totalStudents(students.size())
                .totalHalls(halls.size())
                .totalCapacity(availableSeats.size())
                .strategy(request.getStrategy())
                .hallBreakdown(hallBreakdown)
                .previewAllocations(previewList)
                .metrics(metrics)
                .build();
    }

    @Override
    @Transactional
    public AllocationResponse regenerateAllocation(GenerateAllocationRequest request) {
        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + request.getExamId()));

        if (exam.getStatus() == ExamStatus.PUBLISHED) {
            throw new ConflictException("Allocation cannot be modified after publication.");
        }
        if (exam.getStatus() == ExamStatus.COMPLETED || exam.getStatus() == ExamStatus.CANCELLED) {
            throw new ConflictException("Cannot regenerate allocation for exam with status: " + exam.getStatus());
        }

        auditLogRepository.save(AuditLog.builder()
                .action("ALLOCATION_REGENERATED")
                .entityType("EXAM")
                .entityId(exam.getId().toString())
                .details("Admin requested allocation regeneration")
                .build());

        return generateAllocation(request);
    }

    @Override
    @Transactional
    public ExamDto publishAllocation(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));

        if (exam.getStatus() == ExamStatus.DRAFT || exam.getStatus() == ExamStatus.SCHEDULED) {
            long allocCount = allocationRepository.countByExamId(examId);
            if (allocCount == 0) {
                throw new ConflictException("Cannot publish exam without generating seat allocation first.");
            }
        }

        exam.setStatus(ExamStatus.PUBLISHED);
        exam = examRepository.save(exam);

        // Notify students registered for this exam
        List<SeatAllocation> allocations = allocationRepository.findAllByExamId(examId);
        List<Notification> notifications = new ArrayList<>();

        for (SeatAllocation sa : allocations) {
            if (sa.getStudent().getUser() != null) {
                notifications.add(Notification.builder()
                        .user(sa.getStudent().getUser())
                        .type("ALLOCATION_PUBLISHED")
                        .title("Seating Allocation Published: " + exam.getSubject().getName())
                        .message("Your seat allocation for " + exam.getSubject().getName() + " on " +
                                exam.getExamDate() + " (" + exam.getStartTime() + ") has been published. Hall: " +
                                sa.getHall().getHallName() + ", Seat: " + sa.getSeat().getSeatNumber())
                        .read(false)
                        .build());
            }
        }

        if (!notifications.isEmpty()) {
            notificationRepository.saveAll(notifications);
        }

        // Record audit
        auditLogRepository.save(AuditLog.builder()
                .action("ALLOCATION_PUBLISHED")
                .entityType("EXAM")
                .entityId(exam.getId().toString())
                .details("Published seat allocation for " + allocations.size() + " students")
                .build());

        return ExamDto.builder()
                .id(exam.getId())
                .subjectId(exam.getSubject().getId())
                .subjectCode(exam.getSubject().getCode())
                .subjectName(exam.getSubject().getName())
                .departmentId(exam.getSubject().getDepartment().getId())
                .departmentName(exam.getSubject().getDepartment().getName())
                .examDate(exam.getExamDate())
                .startTime(exam.getStartTime())
                .endTime(exam.getEndTime())
                .durationMinutes(exam.getDurationMinutes())
                .semester(exam.getSemester())
                .academicYear(exam.getAcademicYear())
                .examType(exam.getExamType())
                .status(exam.getStatus())
                .registeredStudentsCount(registrationRepository.countByExamId(exam.getId()))
                .allocatedStudentsCount(allocations.size())
                .createdAt(exam.getCreatedAt())
                .updatedAt(exam.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SeatAllocationDto> getAllocationsByExam(Long examId) {
        return allocationRepository.findAllByExamId(examId).stream()
                .map(this::mapAllocToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SeatAllocationDto> getAllocationsByExamAndHall(Long examId, Long hallId) {
        return allocationRepository.findAllByExamIdAndHallId(examId, hallId).stream()
                .map(this::mapAllocToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SeatAllocationDto getStudentAllocation(Long examId, Long studentId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));

        if (exam.getStatus() != ExamStatus.PUBLISHED && exam.getStatus() != ExamStatus.ONGOING && exam.getStatus() != ExamStatus.COMPLETED) {
            throw new ConflictException("Allocation has not been published for this exam yet.");
        }

        SeatAllocation allocation = allocationRepository.findByExamIdAndStudentId(examId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("No seat allocation found for student ID " + studentId + " in exam ID " + examId));

        return mapAllocToDto(allocation);
    }

    @Override
    @Transactional(readOnly = true)
    public AllocationMetricsDto getQualityMetrics(Long examId) {
        List<SeatAllocation> allocations = allocationRepository.findAllByExamId(examId);
        if (allocations.isEmpty()) {
            throw new ResourceNotFoundException("No allocations found for exam ID: " + examId);
        }

        List<Student> students = allocations.stream().map(SeatAllocation::getStudent).collect(Collectors.toList());
        List<ExamHall> halls = allocations.stream().map(SeatAllocation::getHall).distinct().collect(Collectors.toList());
        List<Seat> seats = allocations.stream().map(SeatAllocation::getSeat).collect(Collectors.toList());

        return calculateMetrics(students, seats, allocations, halls);
    }

    private List<ExamHall> validateAndFetchHalls(List<Long> hallIds, Exam exam) {
        List<ExamHall> halls = new ArrayList<>();
        for (Long hallId : hallIds) {
            ExamHall hall = hallRepository.findById(hallId)
                    .orElseThrow(() -> new ResourceNotFoundException("Exam hall not found with id: " + hallId));

            if (!hall.isActive()) {
                throw new ConflictException("Hall '" + hall.getHallName() + "' is inactive and cannot be used.");
            }

            // Hall availability check: verify hall is not double-booked for another exam at overlapping time
            List<ExamHall> conflictingHalls = hallRepository.findConflictingAllocatedHalls(
                    hallId,
                    exam.getExamDate(),
                    exam.getStartTime(),
                    exam.getEndTime(),
                    exam.getId()
            );

            if (!conflictingHalls.isEmpty()) {
                throw new ConflictException("Hall is already occupied during this examination period.");
            }

            halls.add(hall);
        }
        return halls;
    }

    private AllocationMetricsDto calculateMetrics(
            List<Student> students,
            List<Seat> seats,
            List<SeatAllocation> allocations,
            List<ExamHall> halls
    ) {
        int totalStudents = students.size();
        int totalCapacity = seats.size();
        int seatsUsed = allocations.size();
        int remainingCapacity = totalCapacity - seatsUsed;
        double utilization = totalCapacity > 0 ? (seatsUsed * 100.0) / totalCapacity : 0.0;

        // Department distribution
        Map<String, Integer> deptDist = new HashMap<>();
        for (SeatAllocation sa : allocations) {
            String deptCode = sa.getStudent().getDepartment().getCode();
            deptDist.put(deptCode, deptDist.getOrDefault(deptCode, 0) + 1);
        }

        // Section distribution
        Map<String, Integer> secDist = new HashMap<>();
        for (SeatAllocation sa : allocations) {
            String sec = sa.getStudent().getSection();
            secDist.put(sec, secDist.getOrDefault(sec, 0) + 1);
        }

        // Hall utilization
        Map<String, Integer> hallDist = new HashMap<>();
        for (SeatAllocation sa : allocations) {
            String hName = sa.getHall().getHallName();
            hallDist.put(hName, hallDist.getOrDefault(hName, 0) + 1);
        }

        // Calculate mixing score: percentage of adjacent seats with different departments
        double mixingScore = calculateMixingScoreFromAllocations(allocations);

        return AllocationMetricsDto.builder()
                .totalStudents(totalStudents)
                .studentsAllocated(seatsUsed)
                .totalCapacity(totalCapacity)
                .seatsUsed(seatsUsed)
                .remainingCapacity(remainingCapacity)
                .hallsUsed(halls.size())
                .capacityUtilizationPercentage(Math.round(utilization * 100.0) / 100.0)
                .mixingScore(Math.round(mixingScore * 100.0) / 100.0)
                .conflictsDetected(0)
                .departmentDistribution(deptDist)
                .sectionDistribution(secDist)
                .hallUtilization(hallDist)
                .build();
    }

    private AllocationMetricsDto calculateMetricsForPairs(
            List<Student> students,
            List<Seat> seats,
            List<StudentSeatPair> pairs,
            List<ExamHall> halls
    ) {
        int totalStudents = students.size();
        int totalCapacity = seats.size();
        int seatsUsed = pairs.size();
        int remainingCapacity = totalCapacity - seatsUsed;
        double utilization = totalCapacity > 0 ? (seatsUsed * 100.0) / totalCapacity : 0.0;

        Map<String, Integer> deptDist = new HashMap<>();
        Map<String, Integer> secDist = new HashMap<>();
        Map<String, Integer> hallDist = new HashMap<>();

        for (StudentSeatPair p : pairs) {
            String deptCode = p.getStudent().getDepartment().getCode();
            deptDist.put(deptCode, deptDist.getOrDefault(deptCode, 0) + 1);

            String sec = p.getStudent().getSection();
            secDist.put(sec, secDist.getOrDefault(sec, 0) + 1);

            String hName = p.getSeat().getHall().getHallName();
            hallDist.put(hName, hallDist.getOrDefault(hName, 0) + 1);
        }

        double mixingScore = calculateMixingScoreFromPairs(pairs);

        return AllocationMetricsDto.builder()
                .totalStudents(totalStudents)
                .studentsAllocated(seatsUsed)
                .totalCapacity(totalCapacity)
                .seatsUsed(seatsUsed)
                .remainingCapacity(remainingCapacity)
                .hallsUsed(halls.size())
                .capacityUtilizationPercentage(Math.round(utilization * 100.0) / 100.0)
                .mixingScore(Math.round(mixingScore * 100.0) / 100.0)
                .conflictsDetected(0)
                .departmentDistribution(deptDist)
                .sectionDistribution(secDist)
                .hallUtilization(hallDist)
                .build();
    }

    private double calculateMixingScoreFromAllocations(List<SeatAllocation> allocations) {
        if (allocations.size() <= 1) return 100.0;
        int mixedPairs = 0;
        int totalPairs = allocations.size() - 1;
        for (int i = 0; i < totalPairs; i++) {
            Long dept1 = allocations.get(i).getStudent().getDepartment().getId();
            Long dept2 = allocations.get(i + 1).getStudent().getDepartment().getId();
            if (!Objects.equals(dept1, dept2)) {
                mixedPairs++;
            }
        }
        return (mixedPairs * 100.0) / totalPairs;
    }

    private double calculateMixingScoreFromPairs(List<StudentSeatPair> pairs) {
        if (pairs.size() <= 1) return 100.0;
        int mixedPairs = 0;
        int totalPairs = pairs.size() - 1;
        for (int i = 0; i < totalPairs; i++) {
            Long dept1 = pairs.get(i).getStudent().getDepartment().getId();
            Long dept2 = pairs.get(i + 1).getStudent().getDepartment().getId();
            if (!Objects.equals(dept1, dept2)) {
                mixedPairs++;
            }
        }
        return (mixedPairs * 100.0) / totalPairs;
    }

    private SeatAllocationDto mapAllocToDto(SeatAllocation a) {
        return SeatAllocationDto.builder()
                .id(a.getId())
                .examId(a.getExam().getId())
                .subjectName(a.getExam().getSubject().getName())
                .subjectCode(a.getExam().getSubject().getCode())
                .studentId(a.getStudent().getId())
                .studentName(a.getStudent().getName())
                .rollNumber(a.getStudent().getRollNumber())
                .registrationNumber(a.getStudent().getRegistrationNumber())
                .departmentName(a.getStudent().getDepartment().getName())
                .departmentCode(a.getStudent().getDepartment().getCode())
                .section(a.getStudent().getSection())
                .hallId(a.getHall().getId())
                .hallName(a.getHall().getHallName())
                .building(a.getHall().getBuilding())
                .floor(a.getHall().getFloor())
                .roomNumber(a.getHall().getRoomNumber())
                .seatId(a.getSeat().getId())
                .seatNumber(a.getSeat().getSeatNumber())
                .rowNumber(a.getSeat().getRowNumber())
                .columnNumber(a.getSeat().getColumnNumber())
                .allocationNumber(a.getAllocationNumber())
                .status(a.getStatus())
                .allocatedAt(a.getAllocatedAt())
                .build();
    }
}
