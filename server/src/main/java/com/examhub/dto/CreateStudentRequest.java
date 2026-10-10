package com.examhub.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateStudentRequest {

    @NotBlank(message = "Roll number is required")
    @Size(min = 2, max = 50, message = "Roll number must be between 2 and 50 characters")
    private String rollNumber;

    @NotBlank(message = "Registration number is required")
    @Size(min = 2, max = 50, message = "Registration number must be between 2 and 50 characters")
    private String registrationNumber;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 150, message = "Name must be between 2 and 150 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String phone;

    @NotNull(message = "Department ID is required")
    private Long departmentId;

    @NotBlank(message = "Section is required")
    @Size(max = 20, message = "Section must be at most 20 characters")
    private String section;

    @NotNull(message = "Semester is required")
    @Min(value = 1, message = "Semester must be at least 1")
    @Max(value = 12, message = "Semester must be at most 12")
    private Integer semester;

    @NotNull(message = "Academic year is required")
    @Min(value = 1, message = "Academic year must be at least 1")
    private Integer academicYear;
}
