package com.examhub.service.impl;

import com.examhub.dto.CreateSubjectRequest;
import com.examhub.dto.SubjectDto;
import com.examhub.dto.UpdateSubjectRequest;
import com.examhub.entity.Department;
import com.examhub.entity.Subject;
import com.examhub.exception.ConflictException;
import com.examhub.exception.ResourceNotFoundException;
import com.examhub.repository.DepartmentRepository;
import com.examhub.repository.SubjectRepository;
import com.examhub.service.SubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubjectServiceImpl implements SubjectService {

    private final SubjectRepository subjectRepository;
    private final DepartmentRepository departmentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SubjectDto> getAllSubjects(boolean onlyActive) {
        List<Subject> list = onlyActive
                ? subjectRepository.findAllByActiveTrue()
                : subjectRepository.findAll();
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubjectDto> getSubjectsByDepartment(Long departmentId) {
        return subjectRepository.findAllByDepartmentIdAndActiveTrue(departmentId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SubjectDto getSubjectById(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));
        return mapToDto(subject);
    }

    @Override
    @Transactional
    public SubjectDto createSubject(CreateSubjectRequest request) {
        String code = request.getCode().trim().toUpperCase();
        if (subjectRepository.existsByCode(code)) {
            throw new ConflictException("Subject with code '" + code + "' already exists");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));

        Subject subject = Subject.builder()
                .code(code)
                .name(request.getName().trim())
                .department(department)
                .semester(request.getSemester())
                .credits(request.getCredits() != null ? request.getCredits() : 3)
                .active(true)
                .build();

        return mapToDto(subjectRepository.save(subject));
    }

    @Override
    @Transactional
    public SubjectDto updateSubject(Long id, UpdateSubjectRequest request) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));

        if (request.getCode() != null) {
            String newCode = request.getCode().trim().toUpperCase();
            if (!newCode.equalsIgnoreCase(subject.getCode()) && subjectRepository.existsByCode(newCode)) {
                throw new ConflictException("Subject with code '" + newCode + "' already exists");
            }
            subject.setCode(newCode);
        }

        if (request.getName() != null) {
            subject.setName(request.getName().trim());
        }

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));
            subject.setDepartment(department);
        }

        if (request.getSemester() != null) {
            subject.setSemester(request.getSemester());
        }

        if (request.getCredits() != null) {
            subject.setCredits(request.getCredits());
        }

        if (request.getActive() != null) {
            subject.setActive(request.getActive());
        }

        return mapToDto(subjectRepository.save(subject));
    }

    @Override
    @Transactional
    public void deleteSubject(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));
        subject.setActive(false);
        subjectRepository.save(subject);
    }

    private SubjectDto mapToDto(Subject s) {
        return SubjectDto.builder()
                .id(s.getId())
                .code(s.getCode())
                .name(s.getName())
                .departmentId(s.getDepartment().getId())
                .departmentName(s.getDepartment().getName())
                .departmentCode(s.getDepartment().getCode())
                .semester(s.getSemester())
                .credits(s.getCredits())
                .active(s.isActive())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
