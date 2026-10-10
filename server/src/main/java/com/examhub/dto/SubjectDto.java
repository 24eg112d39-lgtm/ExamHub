package com.examhub.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectDto {
    private Long id;
    private String code;
    private String name;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private Integer semester;
    private Integer credits;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
