package com.examhub.dto;

import com.examhub.entity.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class ReportDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentAllocationItem {
        private String rollNumber;
        private String registrationNumber;
        private String studentName;
        private String departmentCode;
        private String section;
        private String subjectName;
        private LocalDate examDate;
        private String hallName;
        private String building;
        private String roomNumber;
        private String seatNumber;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HallAllocationItem {
        private String hallName;
        private String building;
        private String roomNumber;
        private String seatNumber;
        private String rollNumber;
        private String studentName;
        private String departmentCode;
        private String section;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentAllocationItem {
        private String departmentCode;
        private String departmentName;
        private int studentCount;
        private int hallsUsed;
        private List<String> hallNames;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrintableSeatingPlan {
        private String institutionName;
        private String examName;
        private String subjectName;
        private String subjectCode;
        private LocalDate examDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private String building;
        private String roomNumber;
        private String hallName;
        private int totalAllocated;
        private List<HallAllocationItem> seats;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceReportItem {
        private Long examId;
        private String subjectName;
        private String subjectCode;
        private LocalDate examDate;
        private int totalStudents;
        private int present;
        private int absent;
        private int malpractice;
        private int notMarked;
        private double attendancePercentage;
    }
}
