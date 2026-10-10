package com.examhub.service.impl;

import com.examhub.dto.AttendanceDtos;
import com.examhub.entity.*;
import com.examhub.exception.BadRequestException;
import com.examhub.exception.ConflictException;
import com.examhub.exception.ResourceNotFoundException;
import com.examhub.repository.*;
import com.examhub.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final ExamRepository examRepository;
    private final ExamHallRepository hallRepository;
    private final SeatAllocationRepository allocationRepository;
    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final InvigilatorAssignmentRepository assignmentRepository;
    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional
    public List<AttendanceDtos.RecordDto> getAttendanceForHall(Long examId, Long hallId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));

        ExamHall hall = hallRepository.findById(hallId)
                .orElseThrow(() -> new ResourceNotFoundException("Hall not found with id: " + hallId));

        // Get all allocated students in this hall
        List<SeatAllocation> allocations = allocationRepository.findAllByExamIdAndHallId(examId, hallId);
        if (allocations.isEmpty()) {
            return List.of();
        }

        // Ensure attendance records exist for each allocated student
        List<Attendance> attendancesToSave = new ArrayList<>();
        for (SeatAllocation sa : allocations) {
            Optional<Attendance> existing = attendanceRepository.findByExamIdAndStudentId(examId, sa.getStudent().getId());
            if (existing.isEmpty()) {
                Attendance att = Attendance.builder()
                        .exam(exam)
                        .student(sa.getStudent())
                        .hall(hall)
                        .seat(sa.getSeat())
                        .status(AttendanceStatus.NOT_MARKED)
                        .build();
                attendancesToSave.add(att);
            }
        }

        if (!attendancesToSave.isEmpty()) {
            attendanceRepository.saveAll(attendancesToSave);
        }

        return attendanceRepository.findAllByExamIdAndHallId(examId, hallId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AttendanceDtos.RecordDto markAttendance(AttendanceDtos.MarkRequest request, Long markerUserId) {
        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + request.getExamId()));

        User marker = userRepository.findById(markerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + markerUserId));

        SeatAllocation allocation = allocationRepository.findByExamIdAndStudentId(request.getExamId(), request.getStudentId())
                .orElseThrow(() -> new BadRequestException("Student is not allocated for this examination."));

        Attendance attendance = attendanceRepository.findByExamIdAndStudentId(request.getExamId(), request.getStudentId())
                .orElseGet(() -> Attendance.builder()
                        .exam(exam)
                        .student(allocation.getStudent())
                        .hall(allocation.getHall())
                        .seat(allocation.getSeat())
                        .build());

        attendance.setStatus(request.getStatus());
        attendance.setMarkedBy(marker);
        attendance.setMarkedAt(LocalDateTime.now());

        attendance = attendanceRepository.save(attendance);

        auditLogRepository.save(AuditLog.builder()
                .user(marker)
                .action("ATTENDANCE_MARKED")
                .entityType("ATTENDANCE")
                .entityId(attendance.getId().toString())
                .details("Marked " + attendance.getStudent().getRollNumber() + " as " + request.getStatus() +
                        " in exam " + exam.getSubject().getName())
                .build());

        return mapToDto(attendance);
    }

    @Override
    @Transactional
    public void markAllPresent(Long examId, Long hallId, Long markerUserId) {
        User marker = userRepository.findById(markerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + markerUserId));

        List<AttendanceDtos.RecordDto> records = getAttendanceForHall(examId, hallId);
        List<Attendance> toUpdate = new ArrayList<>();

        for (AttendanceDtos.RecordDto r : records) {
            Attendance att = attendanceRepository.findById(r.getId())
                    .orElse(null);
            if (att != null && att.getStatus() == AttendanceStatus.NOT_MARKED) {
                att.setStatus(AttendanceStatus.PRESENT);
                att.setMarkedBy(marker);
                att.setMarkedAt(LocalDateTime.now());
                toUpdate.add(att);
            }
        }

        if (!toUpdate.isEmpty()) {
            attendanceRepository.saveAll(toUpdate);
        }

        auditLogRepository.save(AuditLog.builder()
                .user(marker)
                .action("BATCH_ATTENDANCE_MARKED")
                .entityType("EXAM")
                .entityId(examId.toString())
                .details("Quick-marked remaining students as PRESENT in hall " + hallId)
                .build());
    }

    @Override
    @Transactional
    public void submitAttendance(Long examId, Long hallId, Long markerUserId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));

        ExamHall hall = hallRepository.findById(hallId)
                .orElseThrow(() -> new ResourceNotFoundException("Hall not found with id: " + hallId));

        User marker = userRepository.findById(markerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + markerUserId));

        // Update invigilator assignment status to COMPLETED
        Optional<InvigilatorAssignment> assignmentOpt = assignmentRepository.findByExamIdAndHallId(examId, hallId);
        if (assignmentOpt.isPresent()) {
            InvigilatorAssignment assignment = assignmentOpt.get();
            assignment.setStatus(InvigilatorAssignmentStatus.COMPLETED);
            assignmentRepository.save(assignment);
        }

        auditLogRepository.save(AuditLog.builder()
                .user(marker)
                .action("ATTENDANCE_SUBMITTED")
                .entityType("EXAM")
                .entityId(examId.toString())
                .details("Finalized and submitted attendance for hall " + hall.getHallName() + " (" + hall.getRoomNumber() + ")")
                .build());
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceDtos.SummaryDto getAttendanceSummary(Long examId, Long hallId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));

        ExamHall hall = hallRepository.findById(hallId)
                .orElseThrow(() -> new ResourceNotFoundException("Hall not found with id: " + hallId));

        List<SeatAllocation> allocations = allocationRepository.findAllByExamIdAndHallId(examId, hallId);
        List<Attendance> attendances = attendanceRepository.findAllByExamIdAndHallId(examId, hallId);

        int present = (int) attendances.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        int absent = (int) attendances.stream().filter(a -> a.getStatus() == AttendanceStatus.ABSENT).count();
        int malpractice = (int) attendances.stream().filter(a -> a.getStatus() == AttendanceStatus.MALPRACTICE).count();
        int total = allocations.size();
        int notMarked = Math.max(0, total - (present + absent + malpractice));

        double percentage = total > 0 ? (present * 100.0) / total : 0.0;

        boolean submitted = assignmentRepository.findByExamIdAndHallId(examId, hallId)
                .map(a -> a.getStatus() == InvigilatorAssignmentStatus.COMPLETED)
                .orElse(false);

        return AttendanceDtos.SummaryDto.builder()
                .examId(examId)
                .subjectName(exam.getSubject().getName())
                .hallId(hallId)
                .hallName(hall.getHallName())
                .totalAllocated(total)
                .present(present)
                .absent(absent)
                .malpractice(malpractice)
                .notMarked(notMarked)
                .attendancePercentage(Math.round(percentage * 100.0) / 100.0)
                .submitted(submitted)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceDtos.SummaryDto> getExamAttendanceSummaries(Long examId) {
        List<SeatAllocation> allocations = allocationRepository.findAllByExamId(examId);
        List<ExamHall> halls = allocations.stream().map(SeatAllocation::getHall).distinct().collect(Collectors.toList());

        return halls.stream()
                .map(h -> getAttendanceSummary(examId, h.getId()))
                .collect(Collectors.toList());
    }

    private AttendanceDtos.RecordDto mapToDto(Attendance a) {
        return AttendanceDtos.RecordDto.builder()
                .id(a.getId())
                .examId(a.getExam().getId())
                .subjectName(a.getExam().getSubject().getName())
                .studentId(a.getStudent().getId())
                .studentName(a.getStudent().getName())
                .rollNumber(a.getStudent().getRollNumber())
                .registrationNumber(a.getStudent().getRegistrationNumber())
                .departmentCode(a.getStudent().getDepartment().getCode())
                .section(a.getStudent().getSection())
                .hallId(a.getHall().getId())
                .hallName(a.getHall().getHallName())
                .seatId(a.getSeat().getId())
                .seatNumber(a.getSeat().getSeatNumber())
                .rowNumber(a.getSeat().getRowNumber())
                .columnNumber(a.getSeat().getColumnNumber())
                .status(a.getStatus())
                .markedById(a.getMarkedBy() != null ? a.getMarkedBy().getId() : null)
                .markedByName(a.getMarkedBy() != null ? a.getMarkedBy().getName() : null)
                .markedAt(a.getMarkedAt())
                .build();
    }
}
