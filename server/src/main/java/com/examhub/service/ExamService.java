package com.examhub.service;

import com.examhub.dto.CreateExamRequest;
import com.examhub.dto.ExamDto;
import com.examhub.dto.ExamRegistrationDto;
import com.examhub.dto.UpdateExamRequest;

import java.util.List;

public interface ExamService {
    List<ExamDto> getAllExams();
    List<ExamDto> getUpcomingExams();
    List<ExamDto> getExamsForStudent(Long studentId);
    List<ExamDto> getExamsForInvigilator(Long invigilatorId);
    ExamDto getExamById(Long id);
    ExamDto createExam(CreateExamRequest request);
    ExamDto updateExam(Long id, UpdateExamRequest request);
    void cancelExam(Long id);
    void completeExam(Long id);

    // Registrations
    List<ExamRegistrationDto> getRegisteredStudents(Long examId);
    int registerStudents(Long examId, List<Long> studentIds);
    void unregisterStudent(Long examId, Long studentId);
}
