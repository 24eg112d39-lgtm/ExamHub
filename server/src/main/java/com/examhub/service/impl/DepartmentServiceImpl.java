package com.examhub.service.impl;

import com.examhub.dto.CreateDepartmentRequest;
import com.examhub.dto.DepartmentDto;
import com.examhub.dto.UpdateDepartmentRequest;
import com.examhub.entity.Department;
import com.examhub.exception.ConflictException;
import com.examhub.exception.ResourceNotFoundException;
import com.examhub.repository.DepartmentRepository;
import com.examhub.repository.StudentRepository;
import com.examhub.repository.SubjectRepository;
import com.examhub.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentDto> getAllDepartments(boolean onlyActive) {
        List<Department> list = onlyActive
                ? departmentRepository.findAllByActiveTrue()
                : departmentRepository.findAll();
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentDto getDepartmentById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        return mapToDto(dept);
    }

    @Override
    @Transactional
    public DepartmentDto createDepartment(CreateDepartmentRequest request) {
        String code = request.getCode().trim().toUpperCase();
        if (departmentRepository.existsByCode(code)) {
            throw new ConflictException("Department with code '" + code + "' already exists");
        }

        Department dept = Department.builder()
                .name(request.getName().trim())
                .code(code)
                .description(request.getDescription())
                .active(true)
                .build();

        return mapToDto(departmentRepository.save(dept));
    }

    @Override
    @Transactional
    public DepartmentDto updateDepartment(Long id, UpdateDepartmentRequest request) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        if (request.getCode() != null) {
            String newCode = request.getCode().trim().toUpperCase();
            if (!newCode.equalsIgnoreCase(dept.getCode()) && departmentRepository.existsByCode(newCode)) {
                throw new ConflictException("Department with code '" + newCode + "' already exists");
            }
            dept.setCode(newCode);
        }

        if (request.getName() != null) {
            dept.setName(request.getName().trim());
        }

        if (request.getDescription() != null) {
            dept.setDescription(request.getDescription());
        }

        if (request.getActive() != null) {
            dept.setActive(request.getActive());
        }

        return mapToDto(departmentRepository.save(dept));
    }

    @Override
    @Transactional
    public void deleteDepartment(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        // Soft delete / deactivation to preserve relational integrity
        dept.setActive(false);
        departmentRepository.save(dept);
    }

    private DepartmentDto mapToDto(Department d) {
        return DepartmentDto.builder()
                .id(d.getId())
                .name(d.getName())
                .code(d.getCode())
                .description(d.getDescription())
                .active(d.isActive())
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .build();
    }
}
