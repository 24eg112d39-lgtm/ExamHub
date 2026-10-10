package com.examhub.service;

import com.examhub.dto.AdminDashboardStatsDto;
import com.examhub.dto.ReportDtos;

import java.util.List;

public interface ReportService {
    List<ReportDtos.StudentAllocationItem> getStudentAllocationReport(Long examId);
    List<ReportDtos.HallAllocationItem> getHallAllocationReport(Long examId, Long hallId);
    List<ReportDtos.DepartmentAllocationItem> getDepartmentAllocationReport(Long examId);
    ReportDtos.PrintableSeatingPlan getPrintableSeatingPlan(Long examId, Long hallId);
    List<ReportDtos.AttendanceReportItem> getAttendanceReport(Long examId);
    String exportStudentAllocationCsv(Long examId);
    String exportHallAllocationCsv(Long examId, Long hallId);
    AdminDashboardStatsDto getAdminDashboardStats();
}
