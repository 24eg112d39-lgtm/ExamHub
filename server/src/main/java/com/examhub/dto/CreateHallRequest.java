package com.examhub.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateHallRequest {

    @NotBlank(message = "Building name is required")
    private String building;

    @NotNull(message = "Floor is required")
    private Integer floor;

    @NotBlank(message = "Room number is required")
    private String roomNumber;

    @NotBlank(message = "Hall name is required")
    private String hallName;

    @NotNull(message = "Rows count is required")
    @Min(value = 1, message = "Rows must be at least 1")
    @Max(value = 26, message = "Rows must be at most 26 (A-Z)")
    private Integer totalRows;

    @NotNull(message = "Columns count is required")
    @Min(value = 1, message = "Columns must be at least 1")
    @Max(value = 50, message = "Columns must be at most 50")
    private Integer totalColumns;
}
