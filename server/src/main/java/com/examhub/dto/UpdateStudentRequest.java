package com.examhub.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStudentRequest {

    @Size(min = 2, max = 50, message = "Roll number must be between 2 and 50 characters")
    private String rollNumber;

    @Size(min = 2, max = 50, message = "Registration number must be between 2 and 50 characters")
    private String registrationNumber;

    @Size(min = 2, max = 150, message = "Name must be between 2 and 150 characters")
    private String name;

    @Email(message = "Invalid email format")
    private String email;

    private String phone;

    private Long departmentId;

    @Size(max = 20, message = "Section must be at most 20 characters")
    private String section;

    @Min(value = 1, message = "Semester must be at least 1")
    @Max(value = 12, message = "Semester must be at most 12")
    private Integer semester;

    @Min(value = 1, message = "Academic year must be at least 1")
    private Integer academicYear;

    private Boolean active;
}
