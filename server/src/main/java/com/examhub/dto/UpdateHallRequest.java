package com.examhub.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateHallRequest {

    private String building;
    private Integer floor;
    private String roomNumber;
    private String hallName;

    @Min(value = 1, message = "Rows must be at least 1")
    @Max(value = 26, message = "Rows must be at most 26")
    private Integer totalRows;

    @Min(value = 1, message = "Columns must be at least 1")
    @Max(value = 50, message = "Columns must be at most 50")
    private Integer totalColumns;

    private Boolean active;
}
