package com.examhub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDepartmentRequest {

    @NotBlank(message = "Department name is required")
    @Size(min = 2, max = 150, message = "Department name must be between 2 and 150 characters")
    private String name;

    @NotBlank(message = "Department code is required")
    @Size(min = 2, max = 50, message = "Department code must be between 2 and 50 characters")
    private String code;

    private String description;
}
