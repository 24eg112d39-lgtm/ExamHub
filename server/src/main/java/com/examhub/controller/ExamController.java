package com.examhub.controller;

import com.examhub.dto.CreateExamRequest;
import com.examhub.dto.ExamDto;
import com.examhub.dto.ExamRegistrationDto;
import com.examhub.dto.RegisterStudentExamRequest;
import com.examhub.dto.UpdateExamRequest;
import com.examhub.service.ExamService;
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
@RequestMapping("/api/exams")
@RequiredArgsConstructor
@Tag(name = "Examinations", description = "Endpoints for exam scheduling and student registrations")
public class ExamController {

    private final ExamService examService;

    @GetMapping
    @Operation(summary = "Get all exams")
    public ResponseEntity<List<ExamDto>> getAllExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get upcoming scheduled exams")
    public ResponseEntity<List<ExamDto>> getUpcomingExams() {
        return ResponseEntity.ok(examService.getUpcomingExams());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get exam by ID")
    public ResponseEntity<ExamDto> getExamById(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getExamById(id));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STUDENT')")
    @Operation(summary = "Get exams for a specific student")
    public ResponseEntity<List<ExamDto>> getExamsForStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(examService.getExamsForStudent(studentId));
    }

    @GetMapping("/invigilator/{invigilatorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVIGILATOR')")
    @Operation(summary = "Get exams assigned to an invigilator")
    public ResponseEntity<List<ExamDto>> getExamsForInvigilator(@PathVariable Long invigilatorId) {
        return ResponseEntity.ok(examService.getExamsForInvigilator(invigilatorId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create and schedule examination (Admin only)")
    public ResponseEntity<ExamDto> createExam(@Valid @RequestBody CreateExamRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(examService.createExam(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update examination details (Admin only)")
    public ResponseEntity<ExamDto> updateExam(
            @PathVariable Long id,
            @Valid @RequestBody UpdateExamRequest request) {
        return ResponseEntity.ok(examService.updateExam(id, request));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cancel examination (Admin only)")
    public ResponseEntity<Map<String, String>> cancelExam(@PathVariable Long id) {
        examService.cancelExam(id);
        return ResponseEntity.ok(Map.of("message", "Exam cancelled successfully"));
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mark examination as completed (Admin only)")
    public ResponseEntity<Map<String, String>> completeExam(@PathVariable Long id) {
        examService.completeExam(id);
        return ResponseEntity.ok(Map.of("message", "Exam completed successfully"));
    }

    @GetMapping("/{id}/registrations")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVIGILATOR')")
    @Operation(summary = "Get all students registered for an exam")
    public ResponseEntity<List<ExamRegistrationDto>> getRegisteredStudents(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getRegisteredStudents(id));
    }

    @PostMapping("/{id}/registrations")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Register students for an exam (Admin only)")
    public ResponseEntity<Map<String, Object>> registerStudents(
            @PathVariable Long id,
            @Valid @RequestBody RegisterStudentExamRequest.BatchRegisterRequest request) {
        int count = examService.registerStudents(id, request.getStudentIds());
        return ResponseEntity.ok(Map.of(
                "message", "Successfully registered " + count + " students",
                "registeredCount", count
        ));
    }

    @DeleteMapping("/{id}/registrations/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Remove student registration from an exam (Admin only)")
    public ResponseEntity<Map<String, String>> unregisterStudent(
            @PathVariable Long id,
            @PathVariable Long studentId) {
        examService.unregisterStudent(id, studentId);
        return ResponseEntity.ok(Map.of("message", "Student unregistered successfully"));
    }
}
