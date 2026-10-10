package com.examhub.service.impl;

import com.examhub.dto.CreateExamRequest;
import com.examhub.dto.ExamDto;
import com.examhub.dto.ExamRegistrationDto;
import com.examhub.dto.UpdateExamRequest;
import com.examhub.entity.*;
import com.examhub.exception.BadRequestException;
import com.examhub.exception.ConflictException;
import com.examhub.exception.ResourceNotFoundException;
import com.examhub.repository.ExamRegistrationRepository;
import com.examhub.repository.ExamRepository;
import com.examhub.repository.SeatAllocationRepository;
import com.examhub.repository.StudentRepository;
import com.examhub.repository.SubjectRepository;
import com.examhub.service.ExamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final SubjectRepository subjectRepository;
    private final StudentRepository studentRepository;
    private final ExamRegistrationRepository examRegistrationRepository;
    private final SeatAllocationRepository seatAllocationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ExamDto> getAllExams() {
        return examRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamDto> getUpcomingExams() {
        return examRepository.findAllByExamDateGreaterThanEqualOrderByExamDateAscStartTimeAsc(LocalDate.now())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamDto> getExamsForStudent(Long studentId) {
        return examRepository.findExamsForStudent(studentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamDto> getExamsForInvigilator(Long invigilatorId) {
        return examRepository.findExamsForInvigilator(invigilatorId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ExamDto getExamById(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));
        return mapToDto(exam);
    }

    @Override
    @Transactional
    public ExamDto createExam(CreateExamRequest request) {
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new BadRequestException("Exam end time (" + request.getEndTime() + ") must be after start time (" + request.getStartTime() + ")");
        }

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + request.getSubjectId()));

        int durationMinutes = (int) Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();

        Exam exam = Exam.builder()
                .subject(subject)
                .examDate(request.getExamDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .durationMinutes(durationMinutes)
                .semester(request.getSemester())
                .academicYear(request.getAcademicYear().trim())
                .examType(request.getExamType())
                .status(ExamStatus.SCHEDULED)
                .build();

        return mapToDto(examRepository.save(exam));
    }

    @Override
    @Transactional
    public ExamDto updateExam(Long id, UpdateExamRequest request) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));

        if (exam.getStatus() == ExamStatus.COMPLETED || exam.getStatus() == ExamStatus.CANCELLED) {
            throw new ConflictException("Cannot modify exam with status: " + exam.getStatus());
        }

        if (request.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(request.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + request.getSubjectId()));
            exam.setSubject(subject);
        }

        if (request.getExamDate() != null) {
            exam.setExamDate(request.getExamDate());
        }

        if (request.getStartTime() != null) {
            exam.setStartTime(request.getStartTime());
        }

        if (request.getEndTime() != null) {
            exam.setEndTime(request.getEndTime());
        }

        if (!exam.getEndTime().isAfter(exam.getStartTime())) {
            throw new BadRequestException("Exam end time must be after start time");
        }

        exam.setDurationMinutes((int) Duration.between(exam.getStartTime(), exam.getEndTime()).toMinutes());

        if (request.getSemester() != null) {
            exam.setSemester(request.getSemester());
        }

        if (request.getAcademicYear() != null) {
            exam.setAcademicYear(request.getAcademicYear().trim());
        }

        if (request.getExamType() != null) {
            exam.setExamType(request.getExamType());
        }

        if (request.getStatus() != null) {
            exam.setStatus(request.getStatus());
        }

        return mapToDto(examRepository.save(exam));
    }

    @Override
    @Transactional
    public void cancelExam(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));
        exam.setStatus(ExamStatus.CANCELLED);
        examRepository.save(exam);
    }

    @Override
    @Transactional
    public void completeExam(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));
        exam.setStatus(ExamStatus.COMPLETED);
        examRepository.save(exam);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamRegistrationDto> getRegisteredStudents(Long examId) {
        if (!examRepository.existsById(examId)) {
            throw new ResourceNotFoundException("Exam not found with id: " + examId);
        }
        return examRegistrationRepository.findAllByExamId(examId).stream()
                .map(this::mapRegToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public int registerStudents(Long examId, List<Long> studentIds) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));

        if (exam.getStatus() == ExamStatus.COMPLETED || exam.getStatus() == ExamStatus.CANCELLED) {
            throw new ConflictException("Cannot register students for exam with status: " + exam.getStatus());
        }

        List<ExamRegistration> toSave = new ArrayList<>();

        for (Long studentId : studentIds) {
            if (examRegistrationRepository.existsByExamIdAndStudentId(examId, studentId)) {
                continue; // Already registered
            }

            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

            if (!student.isActive()) {
                throw new ConflictException("Cannot register inactive student: " + student.getName() + " (" + student.getRollNumber() + ")");
            }

            // Timetable Conflict Check:
            List<ExamRegistration> conflicts = examRegistrationRepository.findConflictingRegistrations(
                    studentId,
                    exam.getExamDate(),
                    exam.getStartTime(),
                    exam.getEndTime(),
                    exam.getId()
            );

            if (!conflicts.isEmpty()) {
                Exam conflictExam = conflicts.get(0).getExam();
                throw new ConflictException("Timetable conflict: Student " + student.getName() +
                        " (" + student.getRollNumber() + ") is already registered for '" +
                        conflictExam.getSubject().getName() + "' on " + conflictExam.getExamDate() +
                        " (" + conflictExam.getStartTime() + " - " + conflictExam.getEndTime() + ")");
            }

            ExamRegistration reg = ExamRegistration.builder()
                    .exam(exam)
                    .student(student)
                    .registrationStatus(ExamRegistrationStatus.REGISTERED)
                    .build();

            toSave.add(reg);
        }

        if (!toSave.isEmpty()) {
            examRegistrationRepository.saveAll(toSave);
        }

        return toSave.size();
    }

    @Override
    @Transactional
    public void unregisterStudent(Long examId, Long studentId) {
        ExamRegistration reg = examRegistrationRepository.findByExamIdAndStudentId(examId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found for exam " + examId + " and student " + studentId));
        examRegistrationRepository.delete(reg);
    }

    private ExamDto mapToDto(Exam e) {
        long regCount = examRegistrationRepository.countByExamId(e.getId());
        long allocCount = seatAllocationRepository.countByExamId(e.getId());

        return ExamDto.builder()
                .id(e.getId())
                .subjectId(e.getSubject().getId())
                .subjectCode(e.getSubject().getCode())
                .subjectName(e.getSubject().getName())
                .departmentId(e.getSubject().getDepartment().getId())
                .departmentName(e.getSubject().getDepartment().getName())
                .examDate(e.getExamDate())
                .startTime(e.getStartTime())
                .endTime(e.getEndTime())
                .durationMinutes(e.getDurationMinutes())
                .semester(e.getSemester())
                .academicYear(e.getAcademicYear())
                .examType(e.getExamType())
                .status(e.getStatus())
                .registeredStudentsCount(regCount)
                .allocatedStudentsCount(allocCount)
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    private ExamRegistrationDto mapRegToDto(ExamRegistration r) {
        return ExamRegistrationDto.builder()
                .id(r.getId())
                .examId(r.getExam().getId())
                .subjectName(r.getExam().getSubject().getName())
                .subjectCode(r.getExam().getSubject().getCode())
                .studentId(r.getStudent().getId())
                .studentName(r.getStudent().getName())
                .rollNumber(r.getStudent().getRollNumber())
                .registrationNumber(r.getStudent().getRegistrationNumber())
                .departmentName(r.getStudent().getDepartment().getName())
                .departmentCode(r.getStudent().getDepartment().getCode())
                .section(r.getStudent().getSection())
                .registrationStatus(r.getRegistrationStatus())
                .registeredAt(r.getRegisteredAt())
                .build();
    }
}
