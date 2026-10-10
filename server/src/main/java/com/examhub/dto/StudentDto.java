package com.examhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDto {
    private Long id;
    private Long userId;
    private String rollNumber;
    private String registrationNumber;
    private String name;
    private String email;
    private String phone;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private String section;
    private Integer semester;
    private Integer academicYear;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
