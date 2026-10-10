package com.examhub.controller;

import com.examhub.dto.CreateHallRequest;
import com.examhub.dto.ExamHallDto;
import com.examhub.dto.SeatDto;
import com.examhub.dto.UpdateHallRequest;
import com.examhub.service.ExamHallService;
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
@RequestMapping("/api/halls")
@RequiredArgsConstructor
@Tag(name = "Examination Halls", description = "Endpoints for exam halls and seat generation")
public class ExamHallController {

    private final ExamHallService hallService;

    @GetMapping
    @Operation(summary = "Get all exam halls")
    public ResponseEntity<List<ExamHallDto>> getAllHalls(
            @RequestParam(required = false, defaultValue = "false") boolean onlyActive) {
        return ResponseEntity.ok(hallService.getAllHalls(onlyActive));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get exam hall by ID")
    public ResponseEntity<ExamHallDto> getHallById(@PathVariable Long id) {
        return ResponseEntity.ok(hallService.getHallById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create exam hall and auto-generate seats (Admin only)")
    public ResponseEntity<ExamHallDto> createHall(@Valid @RequestBody CreateHallRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hallService.createHall(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update exam hall details (Admin only)")
    public ResponseEntity<ExamHallDto> updateHall(
            @PathVariable Long id,
            @Valid @RequestBody UpdateHallRequest request) {
        return ResponseEntity.ok(hallService.updateHall(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate exam hall (Admin only)")
    public ResponseEntity<Map<String, String>> deleteHall(@PathVariable Long id) {
        hallService.deleteHall(id);
        return ResponseEntity.ok(Map.of("message", "Exam hall deactivated successfully"));
    }

    @GetMapping("/{id}/seats")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVIGILATOR')")
    @Operation(summary = "Get all seats inside an exam hall")
    public ResponseEntity<List<SeatDto>> getSeatsByHall(@PathVariable Long id) {
        return ResponseEntity.ok(hallService.getSeatsByHall(id));
    }

    @PatchMapping("/seats/{seatId}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle individual seat active/disabled status (Admin only)")
    public ResponseEntity<SeatDto> toggleSeatActive(@PathVariable Long seatId) {
        return ResponseEntity.ok(hallService.toggleSeatActive(seatId));
    }

    @PostMapping("/{id}/regenerate-seats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Regenerate seats matrix for a hall (Admin only)")
    public ResponseEntity<Map<String, String>> regenerateSeats(@PathVariable Long id) {
        hallService.regenerateSeatsForHall(id);
        return ResponseEntity.ok(Map.of("message", "Seats regenerated successfully"));
    }
}
