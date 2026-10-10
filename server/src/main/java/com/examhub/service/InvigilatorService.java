package com.examhub.service;

import com.examhub.dto.InvigilatorDtos;
import com.examhub.dto.UserDto;

import java.util.List;

public interface InvigilatorService {
    List<UserDto> getAllInvigilators();
    List<InvigilatorDtos.AssignmentDto> getAssignmentsByExam(Long examId);
    List<InvigilatorDtos.AssignmentDto> getAssignmentsForInvigilator(Long invigilatorId);
    InvigilatorDtos.AssignmentDto assignInvigilator(InvigilatorDtos.AssignRequest request);
    void removeAssignment(Long assignmentId);
}
