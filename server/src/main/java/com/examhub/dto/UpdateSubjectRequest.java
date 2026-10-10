package com.examhub.dto;

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
public class UpdateSubjectRequest {

    @Size(min = 2, max = 50, message = "Subject code must be between 2 and 50 characters")
    private String code;

    @Size(min = 2, max = 150, message = "Subject name must be between 2 and 150 characters")
    private String name;

    private Long departmentId;

    @Min(value = 1, message = "Semester must be at least 1")
    private Integer semester;

    @Min(value = 1, message = "Credits must be at least 1")
    private Integer credits;

    private Boolean active;
}
