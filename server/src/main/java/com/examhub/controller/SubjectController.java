package com.examhub.controller;

import com.examhub.dto.CreateSubjectRequest;
import com.examhub.dto.SubjectDto;
import com.examhub.dto.UpdateSubjectRequest;
import com.examhub.service.SubjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
@Tag(name = "Subjects", description = "Endpoints for academic subjects management")
public class SubjectController {

    private final SubjectService subjectService;

    @GetMapping
    @Operation(summary = "Get all subjects")
    public ResponseEntity<List<SubjectDto>> getAllSubjects(
            @RequestParam(required = false, defaultValue = "false") boolean onlyActive) {
        return ResponseEntity.ok(subjectService.getAllSubjects(onlyActive));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get subject by ID")
    public ResponseEntity<SubjectDto> getSubjectById(@PathVariable Long id) {
        return ResponseEntity.ok(subjectService.getSubjectById(id));
    }

    @GetMapping("/department/{departmentId}")
    @Operation(summary = "Get subjects by department ID")
    public ResponseEntity<List<SubjectDto>> getSubjectsByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(subjectService.getSubjectsByDepartment(departmentId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create subject (Admin only)")
    public ResponseEntity<SubjectDto> createSubject(@Valid @RequestBody CreateSubjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subjectService.createSubject(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update subject (Admin only)")
    public ResponseEntity<SubjectDto> updateSubject(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSubjectRequest request) {
        return ResponseEntity.ok(subjectService.updateSubject(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate subject (Admin only)")
    public ResponseEntity<Map<String, String>> deleteSubject(@PathVariable Long id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.ok(Map.of("message", "Subject deactivated successfully"));
    }
}
