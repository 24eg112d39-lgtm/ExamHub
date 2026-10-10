package com.examhub.service;

import com.examhub.dto.CreateSubjectRequest;
import com.examhub.dto.SubjectDto;
import com.examhub.dto.UpdateSubjectRequest;

import java.util.List;

public interface SubjectService {
    List<SubjectDto> getAllSubjects(boolean onlyActive);
    List<SubjectDto> getSubjectsByDepartment(Long departmentId);
    SubjectDto getSubjectById(Long id);
    SubjectDto createSubject(CreateSubjectRequest request);
    SubjectDto updateSubject(Long id, UpdateSubjectRequest request);
    void deleteSubject(Long id);
}
