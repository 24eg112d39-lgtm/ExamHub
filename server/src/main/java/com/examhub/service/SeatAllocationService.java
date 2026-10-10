package com.examhub.service;

import com.examhub.dto.*;

import java.util.List;

public interface SeatAllocationService {
    AllocationResponse generateAllocation(GenerateAllocationRequest request);
    AllocationPreviewDto previewAllocation(GenerateAllocationRequest request);
    AllocationResponse regenerateAllocation(GenerateAllocationRequest request);
    ExamDto publishAllocation(Long examId);
    List<SeatAllocationDto> getAllocationsByExam(Long examId);
    List<SeatAllocationDto> getAllocationsByExamAndHall(Long examId, Long hallId);
    SeatAllocationDto getStudentAllocation(Long examId, Long studentId);
    AllocationMetricsDto getQualityMetrics(Long examId);
}
