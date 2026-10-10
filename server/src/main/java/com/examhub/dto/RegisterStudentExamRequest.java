package com.examhub.dto;

import com.examhub.entity.ExamRegistrationStatus;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class RegisterStudentExamRequest {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BatchRegisterRequest {
        @NotEmpty(message = "Student IDs cannot be empty")
        private List<Long> studentIds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SingleRegisterRequest {
        private Long studentId;
    }
}
