package com.examhub.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@Tag(name = "Health Check", description = "Endpoints for platform monitoring and Render liveness probes")
public class HealthController {

    @GetMapping({"/api/health", "/health"})
    @Operation(summary = "System Health Check", description = "Returns service availability status for container health probes")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "ExamHub API",
                "version", "1.0.0",
                "timestamp", Instant.now().toString()
        ));
    }
}
