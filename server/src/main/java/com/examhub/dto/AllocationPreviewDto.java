package com.examhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllocationPreviewDto {
    private Long examId;
    private String subjectName;
    private String subjectCode;
    private LocalDate examDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private int totalStudents;
    private int totalHalls;
    private int totalCapacity;
    private AllocationStrategyType strategy;
    private Map<String, Integer> hallBreakdown;
    private List<SeatAllocationDto> previewAllocations;
    private AllocationMetricsDto metrics;
}
