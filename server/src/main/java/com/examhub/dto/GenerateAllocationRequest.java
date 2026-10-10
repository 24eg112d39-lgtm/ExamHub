package com.examhub.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateAllocationRequest {

    @NotNull(message = "Exam ID is required")
    private Long examId;

    @NotNull(message = "Allocation strategy is required")
    private AllocationStrategyType strategy;

    @NotEmpty(message = "At least one exam hall must be selected")
    private List<Long> hallIds;

    private Long randomSeed;
}
