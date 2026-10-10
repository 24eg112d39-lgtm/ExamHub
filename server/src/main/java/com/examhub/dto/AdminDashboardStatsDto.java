package com.examhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStatsDto {
    private long totalStudents;
    private long totalDepartments;
    private long totalSubjects;
    private long totalHalls;
    private long totalSeats;
    private long upcomingExams;
    private long publishedAllocations;
    private long ongoingExams;
    private long completedExams;
    private long totalStudentsAllocated;
    private double overallAttendancePercentage;
}
