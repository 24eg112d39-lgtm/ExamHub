package com.examhub.dto;

import com.examhub.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class AttendanceDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecordDto {
        private Long id;
        private Long examId;
        private String subjectName;
        private Long studentId;
        private String studentName;
        private String rollNumber;
        private String registrationNumber;
        private String departmentCode;
        private String section;
        private Long hallId;
        private String hallName;
        private Long seatId;
        private String seatNumber;
        private Integer rowNumber;
        private Integer columnNumber;
        private AttendanceStatus status;
        private Long markedById;
        private String markedByName;
        private LocalDateTime markedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarkRequest {
        @NotNull(message = "Exam ID is required")
        private Long examId;

        @NotNull(message = "Student ID is required")
        private Long studentId;

        @NotNull(message = "Attendance status is required")
        private AttendanceStatus status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BatchMarkRequest {
        @NotNull(message = "Exam ID is required")
        private Long examId;

        @NotNull(message = "Hall ID is required")
        private Long hallId;

        private List<StudentStatusPair> items;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentStatusPair {
        private Long studentId;
        private AttendanceStatus status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryDto {
        private Long examId;
        private String subjectName;
        private Long hallId;
        private String hallName;
        private int totalAllocated;
        private int present;
        private int absent;
        private int malpractice;
        private int notMarked;
        private double attendancePercentage;
        private boolean submitted;
    }
}
