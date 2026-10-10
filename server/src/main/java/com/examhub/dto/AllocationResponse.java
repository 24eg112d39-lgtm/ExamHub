package com.examhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllocationResponse {
    private Long examId;
    private int studentsAllocated;
    private int hallsUsed;
    private int seatsUsed;
    private AllocationStrategyType strategy;
    private String status;
    private String message;
    private AllocationMetricsDto metrics;
}
