package com.examhub.service;

import com.examhub.dto.CreateDepartmentRequest;
import com.examhub.dto.DepartmentDto;
import com.examhub.dto.UpdateDepartmentRequest;

import java.util.List;

public interface DepartmentService {
    List<DepartmentDto> getAllDepartments(boolean onlyActive);
    DepartmentDto getDepartmentById(Long id);
    DepartmentDto createDepartment(CreateDepartmentRequest request);
    DepartmentDto updateDepartment(Long id, UpdateDepartmentRequest request);
    void deleteDepartment(Long id);
}
