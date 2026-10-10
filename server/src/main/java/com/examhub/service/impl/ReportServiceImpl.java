package com.examhub.service.impl;

import com.examhub.dto.AdminDashboardStatsDto;
import com.examhub.dto.ReportDtos;
import com.examhub.entity.*;
import com.examhub.exception.ResourceNotFoundException;
import com.examhub.repository.*;
import com.examhub.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ExamRepository examRepository;
    private final ExamHallRepository hallRepository;
    private final SeatAllocationRepository allocationRepository;
    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final SubjectRepository subjectRepository;
    private final SeatRepository seatRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ReportDtos.StudentAllocationItem> getStudentAllocationReport(Long examId) {
        List<SeatAllocation> allocations = allocationRepository.findAllByExamId(examId);
        return allocations.stream().map(a -> ReportDtos.StudentAllocationItem.builder()
                .rollNumber(a.getStudent().getRollNumber())
                .registrationNumber(a.getStudent().getRegistrationNumber())
                .studentName(a.getStudent().getName())
                .departmentCode(a.getStudent().getDepartment().getCode())
                .section(a.getStudent().getSection())
                .subjectName(a.getExam().getSubject().getName())
                .examDate(a.getExam().getExamDate())
                .hallName(a.getHall().getHallName())
                .building(a.getHall().getBuilding())
                .roomNumber(a.getHall().getRoomNumber())
                .seatNumber(a.getSeat().getSeatNumber())
                .build()
        ).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReportDtos.HallAllocationItem> getHallAllocationReport(Long examId, Long hallId) {
        List<SeatAllocation> allocations = hallId != null
                ? allocationRepository.findAllByExamIdAndHallId(examId, hallId)
                : allocationRepository.findAllByExamId(examId);

        return allocations.stream().map(a -> ReportDtos.HallAllocationItem.builder()
                .hallName(a.getHall().getHallName())
                .building(a.getHall().getBuilding())
                .roomNumber(a.getHall().getRoomNumber())
                .seatNumber(a.getSeat().getSeatNumber())
                .rollNumber(a.getStudent().getRollNumber())
                .studentName(a.getStudent().getName())
                .departmentCode(a.getStudent().getDepartment().getCode())
                .section(a.getStudent().getSection())
                .build()
        ).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReportDtos.DepartmentAllocationItem> getDepartmentAllocationReport(Long examId) {
        List<SeatAllocation> allocations = allocationRepository.findAllByExamId(examId);

        Map<Department, List<SeatAllocation>> byDept = allocations.stream()
                .collect(Collectors.groupingBy(a -> a.getStudent().getDepartment()));

        List<ReportDtos.DepartmentAllocationItem> result = new ArrayList<>();
        for (Map.Entry<Department, List<SeatAllocation>> entry : byDept.entrySet()) {
            Department dept = entry.getKey();
            List<SeatAllocation> allocs = entry.getValue();
            Set<String> hallNames = allocs.stream()
                    .map(a -> a.getHall().getHallName())
                    .collect(Collectors.toSet());

            result.add(ReportDtos.DepartmentAllocationItem.builder()
                    .departmentCode(dept.getCode())
                    .departmentName(dept.getName())
                    .studentCount(allocs.size())
                    .hallsUsed(hallNames.size())
                    .hallNames(new ArrayList<>(hallNames))
                    .build());
        }

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public ReportDtos.PrintableSeatingPlan getPrintableSeatingPlan(Long examId, Long hallId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));

        ExamHall hall = hallRepository.findById(hallId)
                .orElseThrow(() -> new ResourceNotFoundException("Hall not found with id: " + hallId));

        List<SeatAllocation> allocations = allocationRepository.findAllByExamIdAndHallId(examId, hallId);

        List<ReportDtos.HallAllocationItem> seatItems = allocations.stream().map(a -> ReportDtos.HallAllocationItem.builder()
                .hallName(hall.getHallName())
                .building(hall.getBuilding())
                .roomNumber(hall.getRoomNumber())
                .seatNumber(a.getSeat().getSeatNumber())
                .rollNumber(a.getStudent().getRollNumber())
                .studentName(a.getStudent().getName())
                .departmentCode(a.getStudent().getDepartment().getCode())
                .section(a.getStudent().getSection())
                .build()
        ).collect(Collectors.toList());

        return ReportDtos.PrintableSeatingPlan.builder()
                .institutionName("ExamHub Examination Cell")
                .examName(exam.getSubject().getName() + " - " + exam.getExamType())
                .subjectName(exam.getSubject().getName())
                .subjectCode(exam.getSubject().getCode())
                .examDate(exam.getExamDate())
                .startTime(exam.getStartTime())
                .endTime(exam.getEndTime())
                .building(hall.getBuilding())
                .roomNumber(hall.getRoomNumber())
                .hallName(hall.getHallName())
                .totalAllocated(allocations.size())
                .seats(seatItems)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReportDtos.AttendanceReportItem> getAttendanceReport(Long examId) {
        List<Exam> exams = examId != null
                ? List.of(examRepository.findById(examId).orElseThrow(() -> new ResourceNotFoundException("Exam not found")))
                : examRepository.findAll();

        List<ReportDtos.AttendanceReportItem> list = new ArrayList<>();
        for (Exam e : exams) {
            long total = allocationRepository.countByExamId(e.getId());
            long present = attendanceRepository.countByExamIdAndStatus(e.getId(), AttendanceStatus.PRESENT);
            long absent = attendanceRepository.countByExamIdAndStatus(e.getId(), AttendanceStatus.ABSENT);
            long malpractice = attendanceRepository.countByExamIdAndStatus(e.getId(), AttendanceStatus.MALPRACTICE);
            int notMarked = Math.max(0, (int) (total - (present + absent + malpractice)));
            double pct = total > 0 ? (present * 100.0) / total : 0.0;

            list.add(ReportDtos.AttendanceReportItem.builder()
                    .examId(e.getId())
                    .subjectName(e.getSubject().getName())
                    .subjectCode(e.getSubject().getCode())
                    .examDate(e.getExamDate())
                    .totalStudents((int) total)
                    .present((int) present)
                    .absent((int) absent)
                    .malpractice((int) malpractice)
                    .notMarked(notMarked)
                    .attendancePercentage(Math.round(pct * 100.0) / 100.0)
                    .build());
        }
        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public String exportStudentAllocationCsv(Long examId) {
        List<ReportDtos.StudentAllocationItem> items = getStudentAllocationReport(examId);
        StringBuilder sb = new StringBuilder();
        sb.append("Roll Number,Registration Number,Student Name,Department,Section,Subject,Exam Date,Hall,Building,Room,Seat Number\n");
        for (ReportDtos.StudentAllocationItem it : items) {
            sb.append(escapeCsv(it.getRollNumber())).append(",")
                    .append(escapeCsv(it.getRegistrationNumber())).append(",")
                    .append(escapeCsv(it.getStudentName())).append(",")
                    .append(escapeCsv(it.getDepartmentCode())).append(",")
                    .append(escapeCsv(it.getSection())).append(",")
                    .append(escapeCsv(it.getSubjectName())).append(",")
                    .append(it.getExamDate()).append(",")
                    .append(escapeCsv(it.getHallName())).append(",")
                    .append(escapeCsv(it.getBuilding())).append(",")
                    .append(escapeCsv(it.getRoomNumber())).append(",")
                    .append(escapeCsv(it.getSeatNumber())).append("\n");
        }
        return sb.toString();
    }

    @Override
    @Transactional(readOnly = true)
    public String exportHallAllocationCsv(Long examId, Long hallId) {
        List<ReportDtos.HallAllocationItem> items = getHallAllocationReport(examId, hallId);
        StringBuilder sb = new StringBuilder();
        sb.append("Hall Name,Building,Room,Seat Number,Roll Number,Student Name,Department,Section\n");
        for (ReportDtos.HallAllocationItem it : items) {
            sb.append(escapeCsv(it.getHallName())).append(",")
                    .append(escapeCsv(it.getBuilding())).append(",")
                    .append(escapeCsv(it.getRoomNumber())).append(",")
                    .append(escapeCsv(it.getSeatNumber())).append(",")
                    .append(escapeCsv(it.getRollNumber())).append(",")
                    .append(escapeCsv(it.getStudentName())).append(",")
                    .append(escapeCsv(it.getDepartmentCode())).append(",")
                    .append(escapeCsv(it.getSection())).append("\n");
        }
        return sb.toString();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardStatsDto getAdminDashboardStats() {
        long totalStudents = studentRepository.count();
        long totalDepartments = departmentRepository.count();
        long totalSubjects = subjectRepository.count();
        long totalHalls = hallRepository.count();
        long totalSeats = seatRepository.count();

        LocalDate today = LocalDate.now();
        long upcomingExams = examRepository.findAllByExamDateGreaterThanEqualOrderByExamDateAscStartTimeAsc(today).size();
        long publishedAllocations = examRepository.findAllByStatus(ExamStatus.PUBLISHED).size();
        long ongoingExams = examRepository.findAllByStatus(ExamStatus.ONGOING).size();
        long completedExams = examRepository.findAllByStatus(ExamStatus.COMPLETED).size();
        long totalAllocated = allocationRepository.count();

        long totalAttendanceRecords = attendanceRepository.count();
        long totalPresent = attendanceRepository.findAll().stream()
                .filter(a -> a.getStatus() == AttendanceStatus.PRESENT)
                .count();

        double attendancePct = totalAttendanceRecords > 0 ? (totalPresent * 100.0) / totalAttendanceRecords : 0.0;

        return AdminDashboardStatsDto.builder()
                .totalStudents(totalStudents)
                .totalDepartments(totalDepartments)
                .totalSubjects(totalSubjects)
                .totalHalls(totalHalls)
                .totalSeats(totalSeats)
                .upcomingExams(upcomingExams)
                .publishedAllocations(publishedAllocations)
                .ongoingExams(ongoingExams)
                .completedExams(completedExams)
                .totalStudentsAllocated(totalAllocated)
                .overallAttendancePercentage(Math.round(attendancePct * 100.0) / 100.0)
                .build();
    }

    private String escapeCsv(String val) {
        if (val == null) return "";
        if (val.contains(",") || val.contains("\"") || val.contains("\n")) {
            return "\"" + val.replace("\"", "\"\"") + "\"";
        }
        return val;
    }
}
