package com.examhub.service;

import com.examhub.dto.CreateStudentRequest;
import com.examhub.dto.StudentDto;
import com.examhub.dto.StudentImportResultDto;
import com.examhub.dto.UpdateStudentRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface StudentService {
    Page<StudentDto> getStudents(Long deptId, Integer semester, String section, String search, Pageable pageable);
    List<StudentDto> getAllActiveStudents();
    StudentDto getStudentById(Long id);
    StudentDto getStudentByUserId(Long userId);
    StudentDto getStudentByRollNumber(String rollNumber);
    StudentDto createStudent(CreateStudentRequest request);
    StudentDto updateStudent(Long id, UpdateStudentRequest request);
    void deleteStudent(Long id);
    StudentImportResultDto importStudentsFromCsv(String csvContent);
}
