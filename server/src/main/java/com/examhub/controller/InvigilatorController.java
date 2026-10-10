package com.examhub.controller;

import com.examhub.dto.InvigilatorDtos;
import com.examhub.dto.UserDto;
import com.examhub.security.UserPrincipal;
import com.examhub.service.InvigilatorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invigilators")
@RequiredArgsConstructor
@Tag(name = "Invigilator Management", description = "Endpoints for invigilator duties and assignments")
public class InvigilatorController {

    private final InvigilatorService invigilatorService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get list of all invigilator faculty members (Admin only)")
    public ResponseEntity<List<UserDto>> getAllInvigilators() {
        return ResponseEntity.ok(invigilatorService.getAllInvigilators());
    }

    @GetMapping("/exam/{examId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVIGILATOR')")
    @Operation(summary = "Get invigilator assignments for an exam")
    public ResponseEntity<List<InvigilatorDtos.AssignmentDto>> getAssignmentsByExam(@PathVariable Long examId) {
        return ResponseEntity.ok(invigilatorService.getAssignmentsByExam(examId));
    }

    @GetMapping("/my-assignments")
    @PreAuthorize("hasRole('INVIGILATOR')")
    @Operation(summary = "Get assignments for the logged-in invigilator")
    public ResponseEntity<List<InvigilatorDtos.AssignmentDto>> getMyAssignments(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(invigilatorService.getAssignmentsForInvigilator(principal.getId()));
    }

    @PostMapping("/assign")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign invigilator to an exam hall (Admin only)")
    public ResponseEntity<InvigilatorDtos.AssignmentDto> assignInvigilator(@Valid @RequestBody InvigilatorDtos.AssignRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(invigilatorService.assignInvigilator(request));
    }

    @DeleteMapping("/assignments/{assignmentId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Remove invigilator assignment (Admin only)")
    public ResponseEntity<Map<String, String>> removeAssignment(@PathVariable Long assignmentId) {
        invigilatorService.removeAssignment(assignmentId);
        return ResponseEntity.ok(Map.of("message", "Invigilator assignment removed successfully"));
    }
}
