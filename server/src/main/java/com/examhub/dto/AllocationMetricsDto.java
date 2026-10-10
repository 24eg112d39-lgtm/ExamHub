package com.examhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllocationMetricsDto {
    private int totalStudents;
    private int studentsAllocated;
    private int totalCapacity;
    private int seatsUsed;
    private int remainingCapacity;
    private int hallsUsed;
    private double capacityUtilizationPercentage;
    private double mixingScore; // Percentage of consecutive seats belonging to different departments
    private int conflictsDetected;
    private Map<String, Integer> departmentDistribution;
    private Map<String, Integer> sectionDistribution;
    private Map<String, Integer> hallUtilization;
}
