package com.examhub.dto;

import com.examhub.entity.InvigilatorAssignmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class InvigilatorDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignmentDto {
        private Long id;
        private Long examId;
        private String subjectName;
        private String subjectCode;
        private LocalDate examDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private Long invigilatorId;
        private String invigilatorName;
        private String invigilatorEmail;
        private Long hallId;
        private String hallName;
        private String roomNumber;
        private String building;
        private InvigilatorAssignmentStatus status;
        private long assignedStudentsCount;
        private long presentCount;
        private long absentCount;
        private long malpracticeCount;
        private LocalDateTime assignedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignRequest {
        @NotNull(message = "Exam ID is required")
        private Long examId;

        @NotNull(message = "Invigilator user ID is required")
        private Long invigilatorId;

        @NotNull(message = "Exam hall ID is required")
        private Long hallId;
    }
}
