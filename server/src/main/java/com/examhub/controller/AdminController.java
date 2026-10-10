package com.examhub.controller;

import com.examhub.dto.AdminDashboardStatsDto;
import com.examhub.dto.AuditLogDto;
import com.examhub.entity.AuditLog;
import com.examhub.repository.AuditLogRepository;
import com.examhub.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Platform Administration", description = "Endpoints for platform overview, metrics, and audit logs")
public class AdminController {

    private final ReportService reportService;
    private final AuditLogRepository auditLogRepository;

    @GetMapping("/dashboard-stats")
    @Operation(summary = "Get live database platform statistics for admin dashboard")
    public ResponseEntity<AdminDashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(reportService.getAdminDashboardStats());
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Alias for dashboard stats")
    public ResponseEntity<AdminDashboardStatsDto> getDashboardAlias() {
        return ResponseEntity.ok(reportService.getAdminDashboardStats());
    }

    @GetMapping("/audit-logs")
    @Transactional(readOnly = true)
    @Operation(summary = "Get paginated audit logs")
    public ResponseEntity<Page<AuditLogDto>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::mapAuditToDto));
    }

    @GetMapping("/audit-logs/recent")
    @Transactional(readOnly = true)
    @Operation(summary = "Get top 50 recent audit logs")
    public ResponseEntity<List<AuditLogDto>> getRecentAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findTop50ByOrderByCreatedAtDesc().stream()
                .map(this::mapAuditToDto)
                .collect(Collectors.toList()));
    }

    private AuditLogDto mapAuditToDto(AuditLog a) {
        Long userId = null;
        String userName = "System";
        String userEmail = "system@examhub.com";

        try {
            if (a.getUser() != null) {
                userId = a.getUser().getId();
                userName = a.getUser().getName();
                userEmail = a.getUser().getEmail();
            }
        } catch (Exception ignored) {
            // Fallback gracefully if proxy cannot be accessed
        }

        return AuditLogDto.builder()
                .id(a.getId())
                .userId(userId)
                .userName(userName)
                .userEmail(userEmail)
                .action(a.getAction())
                .entityType(a.getEntityType())
                .entityId(a.getEntityId())
                .details(a.getDetails())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
