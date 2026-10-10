package com.examhub.controller;

import com.examhub.dto.ReportDtos;
import com.examhub.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports & Exports", description = "Endpoints for academic examination reports and CSV exports")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/students/exam/{examId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVIGILATOR')")
    @Operation(summary = "Get student-wise allocation report")
    public ResponseEntity<List<ReportDtos.StudentAllocationItem>> getStudentAllocationReport(@PathVariable Long examId) {
        return ResponseEntity.ok(reportService.getStudentAllocationReport(examId));
    }

    @GetMapping(value = "/students/exam/{examId}/csv", produces = "text/csv")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Export student allocation report as CSV")
    public ResponseEntity<String> exportStudentAllocationCsv(@PathVariable Long examId) {
        String csv = reportService.exportStudentAllocationCsv(examId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"students_exam_" + examId + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @GetMapping("/halls/exam/{examId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVIGILATOR')")
    @Operation(summary = "Get hall-wise allocation report")
    public ResponseEntity<List<ReportDtos.HallAllocationItem>> getHallAllocationReport(
            @PathVariable Long examId,
            @RequestParam(required = false) Long hallId) {
        return ResponseEntity.ok(reportService.getHallAllocationReport(examId, hallId));
    }

    @GetMapping(value = "/halls/exam/{examId}/hall/{hallId}/csv", produces = "text/csv")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Export hall allocation report as CSV")
    public ResponseEntity<String> exportHallAllocationCsv(
            @PathVariable Long examId,
            @PathVariable Long hallId) {
        String csv = reportService.exportHallAllocationCsv(examId, hallId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"hall_" + hallId + "_exam_" + examId + ".csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @GetMapping("/departments/exam/{examId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get department-wise allocation distribution report")
    public ResponseEntity<List<ReportDtos.DepartmentAllocationItem>> getDepartmentAllocationReport(@PathVariable Long examId) {
        return ResponseEntity.ok(reportService.getDepartmentAllocationReport(examId));
    }

    @GetMapping("/printable-seating-plan/exam/{examId}/hall/{hallId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVIGILATOR')")
    @Operation(summary = "Get print-friendly seating plan layout data")
    public ResponseEntity<ReportDtos.PrintableSeatingPlan> getPrintableSeatingPlan(
            @PathVariable Long examId,
            @PathVariable Long hallId) {
        return ResponseEntity.ok(reportService.getPrintableSeatingPlan(examId, hallId));
    }

    @GetMapping("/attendance/exam/{examId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVIGILATOR')")
    @Operation(summary = "Get attendance report for an exam")
    public ResponseEntity<List<ReportDtos.AttendanceReportItem>> getAttendanceReport(@PathVariable Long examId) {
        return ResponseEntity.ok(reportService.getAttendanceReport(examId));
    }
}
