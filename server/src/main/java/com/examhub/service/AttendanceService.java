package com.examhub.service;

import com.examhub.dto.AttendanceDtos;

import java.util.List;

public interface AttendanceService {
    List<AttendanceDtos.RecordDto> getAttendanceForHall(Long examId, Long hallId);
    AttendanceDtos.RecordDto markAttendance(AttendanceDtos.MarkRequest request, Long markerUserId);
    void markAllPresent(Long examId, Long hallId, Long markerUserId);
    void submitAttendance(Long examId, Long hallId, Long markerUserId);
    AttendanceDtos.SummaryDto getAttendanceSummary(Long examId, Long hallId);
    List<AttendanceDtos.SummaryDto> getExamAttendanceSummaries(Long examId);
}
