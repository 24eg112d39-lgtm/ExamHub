package com.examhub.controller;

import com.examhub.dto.*;
import com.examhub.security.UserPrincipal;
import com.examhub.service.SeatAllocationService;
import com.examhub.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/allocations")
@RequiredArgsConstructor
@Tag(name = "Seat Allocation Engine", description = "Endpoints for generating, previewing, and publishing exam seat allocations")
public class AllocationController {

    private final SeatAllocationService allocationService;
    private final StudentService studentService;

    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Generate seat allocation for an examination (Admin only)")
    public ResponseEntity<AllocationResponse> generateAllocation(@Valid @RequestBody GenerateAllocationRequest request) {
        return ResponseEntity.ok(allocationService.generateAllocation(request));
    }

    @PostMapping("/preview")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Preview seat allocation without persisting (Admin only)")
    public ResponseEntity<AllocationPreviewDto> previewAllocation(@Valid @RequestBody GenerateAllocationRequest request) {
        return ResponseEntity.ok(allocationService.previewAllocation(request));
    }

    @PostMapping("/regenerate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Regenerate draft seat allocation (Admin only)")
    public ResponseEntity<AllocationResponse> regenerateAllocation(@Valid @RequestBody GenerateAllocationRequest request) {
        return ResponseEntity.ok(allocationService.regenerateAllocation(request));
    }

    @PostMapping("/{examId}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Publish seating allocation for an examination (Admin only)")
    public ResponseEntity<ExamDto> publishAllocation(@PathVariable Long examId) {
        return ResponseEntity.ok(allocationService.publishAllocation(examId));
    }

    @GetMapping("/exam/{examId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVIGILATOR')")
    @Operation(summary = "Get all seat allocations for an exam")
    public ResponseEntity<List<SeatAllocationDto>> getAllocationsByExam(@PathVariable Long examId) {
        return ResponseEntity.ok(allocationService.getAllocationsByExam(examId));
    }

    @GetMapping("/exam/{examId}/hall/{hallId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVIGILATOR')")
    @Operation(summary = "Get seat allocations for a specific hall in an exam")
    public ResponseEntity<List<SeatAllocationDto>> getAllocationsByExamAndHall(
            @PathVariable Long examId,
            @PathVariable Long hallId) {
        return ResponseEntity.ok(allocationService.getAllocationsByExamAndHall(examId, hallId));
    }

    @GetMapping("/exam/{examId}/my-seat")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get logged in student's allocated seat for an exam")
    public ResponseEntity<SeatAllocationDto> getMyAllocatedSeat(
            @PathVariable Long examId,
            @AuthenticationPrincipal UserPrincipal principal) {
        StudentDto student = studentService.getStudentByUserId(principal.getId());
        return ResponseEntity.ok(allocationService.getStudentAllocation(examId, student.getId()));
    }

    @GetMapping("/exam/{examId}/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVIGILATOR')")
    @Operation(summary = "Get a student's allocated seat for an exam")
    public ResponseEntity<SeatAllocationDto> getStudentAllocation(
            @PathVariable Long examId,
            @PathVariable Long studentId) {
        return ResponseEntity.ok(allocationService.getStudentAllocation(examId, studentId));
    }

    @GetMapping("/exam/{examId}/metrics")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get quality metrics for an allocation")
    public ResponseEntity<AllocationMetricsDto> getMetrics(@PathVariable Long examId) {
        return ResponseEntity.ok(allocationService.getQualityMetrics(examId));
    }
}
