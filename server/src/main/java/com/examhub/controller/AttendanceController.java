package com.examhub.controller;

import com.examhub.dto.AttendanceDtos;
import com.examhub.security.UserPrincipal;
import com.examhub.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
@Tag(name = "Examination Attendance", description = "Endpoints for student exam attendance marking and reports")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/exam/{examId}/hall/{hallId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVIGILATOR')")
    @Operation(summary = "Get seating plan and attendance records for an exam hall")
    public ResponseEntity<List<AttendanceDtos.RecordDto>> getAttendanceForHall(
            @PathVariable Long examId,
            @PathVariable Long hallId) {
        return ResponseEntity.ok(attendanceService.getAttendanceForHall(examId, hallId));
    }

    @PostMapping("/mark")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVIGILATOR')")
    @Operation(summary = "Mark individual student attendance (PRESENT, ABSENT, MALPRACTICE)")
    public ResponseEntity<AttendanceDtos.RecordDto> markAttendance(
            @Valid @RequestBody AttendanceDtos.MarkRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(attendanceService.markAttendance(request, principal.getId()));
    }

    @PostMapping("/exam/{examId}/hall/{hallId}/mark-all-present")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVIGILATOR')")
    @Operation(summary = "Quick-mark all unmarked students as PRESENT in a hall")
    public ResponseEntity<Map<String, String>> markAllPresent(
            @PathVariable Long examId,
            @PathVariable Long hallId,
            @AuthenticationPrincipal UserPrincipal principal) {
        attendanceService.markAllPresent(examId, hallId, principal.getId());
        return ResponseEntity.ok(Map.of("message", "All remaining students marked as PRESENT"));
    }

    @PostMapping("/exam/{examId}/hall/{hallId}/submit")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVIGILATOR')")
    @Operation(summary = "Finalize and submit attendance report for a hall")
    public ResponseEntity<Map<String, String>> submitAttendance(
            @PathVariable Long examId,
            @PathVariable Long hallId,
            @AuthenticationPrincipal UserPrincipal principal) {
        attendanceService.submitAttendance(examId, hallId, principal.getId());
        return ResponseEntity.ok(Map.of("message", "Attendance report submitted successfully"));
    }

    @GetMapping("/summary/exam/{examId}/hall/{hallId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVIGILATOR')")
    @Operation(summary = "Get attendance summary stats for a hall")
    public ResponseEntity<AttendanceDtos.SummaryDto> getAttendanceSummary(
            @PathVariable Long examId,
            @PathVariable Long hallId) {
        return ResponseEntity.ok(attendanceService.getAttendanceSummary(examId, hallId));
    }

    @GetMapping("/summary/exam/{examId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVIGILATOR')")
    @Operation(summary = "Get attendance summaries for all halls in an exam")
    public ResponseEntity<List<AttendanceDtos.SummaryDto>> getExamAttendanceSummaries(@PathVariable Long examId) {
        return ResponseEntity.ok(attendanceService.getExamAttendanceSummaries(examId));
    }
}
