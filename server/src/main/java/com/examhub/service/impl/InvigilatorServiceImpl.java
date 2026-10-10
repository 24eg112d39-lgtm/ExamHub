package com.examhub.service.impl;

import com.examhub.dto.InvigilatorDtos;
import com.examhub.dto.UserDto;
import com.examhub.entity.*;
import com.examhub.exception.ConflictException;
import com.examhub.exception.ResourceNotFoundException;
import com.examhub.repository.*;
import com.examhub.service.InvigilatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvigilatorServiceImpl implements InvigilatorService {

    private final UserRepository userRepository;
    private final ExamRepository examRepository;
    private final ExamHallRepository hallRepository;
    private final InvigilatorAssignmentRepository assignmentRepository;
    private final SeatAllocationRepository allocationRepository;
    private final AttendanceRepository attendanceRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getAllInvigilators() {
        return userRepository.findAllByRoleAndEnabledTrue(Role.INVIGILATOR).stream()
                .map(u -> UserDto.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .phone(u.getPhone())
                        .role(u.getRole())
                        .enabled(u.isEnabled())
                        .createdAt(u.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvigilatorDtos.AssignmentDto> getAssignmentsByExam(Long examId) {
        return assignmentRepository.findAllByExamId(examId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvigilatorDtos.AssignmentDto> getAssignmentsForInvigilator(Long invigilatorId) {
        return assignmentRepository.findAllByInvigilatorId(invigilatorId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InvigilatorDtos.AssignmentDto assignInvigilator(InvigilatorDtos.AssignRequest request) {
        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + request.getExamId()));

        User invigilator = userRepository.findById(request.getInvigilatorId())
                .orElseThrow(() -> new ResourceNotFoundException("Invigilator user not found with id: " + request.getInvigilatorId()));

        if (invigilator.getRole() != Role.INVIGILATOR) {
            throw new ConflictException("User '" + invigilator.getName() + "' is not registered as an INVIGILATOR.");
        }

        if (!invigilator.isEnabled()) {
            throw new ConflictException("Invigilator user account is disabled.");
        }

        ExamHall hall = hallRepository.findById(request.getHallId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam hall not found with id: " + request.getHallId()));

        if (!hall.isActive()) {
            throw new ConflictException("Cannot assign invigilator to an inactive hall.");
        }

        if (assignmentRepository.existsByExamIdAndHallId(exam.getId(), hall.getId())) {
            throw new ConflictException("Hall '" + hall.getHallName() + "' already has an assigned invigilator for this exam.");
        }

        // Schedule overlap detection:
        List<InvigilatorAssignment> conflicts = assignmentRepository.findConflictingAssignments(
                invigilator.getId(),
                exam.getExamDate(),
                exam.getStartTime(),
                exam.getEndTime(),
                exam.getId()
        );

        if (!conflicts.isEmpty()) {
            Exam conflictExam = conflicts.get(0).getExam();
            throw new ConflictException("Schedule conflict: Invigilator " + invigilator.getName() +
                    " is already assigned to exam '" + conflictExam.getSubject().getName() +
                    "' on " + conflictExam.getExamDate() + " (" + conflictExam.getStartTime() + " - " + conflictExam.getEndTime() + ").");
        }

        InvigilatorAssignment assignment = InvigilatorAssignment.builder()
                .exam(exam)
                .invigilator(invigilator)
                .hall(hall)
                .status(InvigilatorAssignmentStatus.ASSIGNED)
                .build();

        assignment = assignmentRepository.save(assignment);

        // Notify invigilator
        notificationRepository.save(Notification.builder()
                .user(invigilator)
                .type("INVIGILATOR_ASSIGNED")
                .title("New Invigilation Duty Assigned")
                .message("You have been assigned to invigilate " + exam.getSubject().getName() + " in " +
                        hall.getHallName() + " on " + exam.getExamDate() + " (" + exam.getStartTime() + " - " + exam.getEndTime() + ").")
                .read(false)
                .build());

        // Audit log
        auditLogRepository.save(AuditLog.builder()
                .action("INVIGILATOR_ASSIGNED")
                .entityType("INVIGILATOR_ASSIGNMENT")
                .entityId(assignment.getId().toString())
                .details("Assigned " + invigilator.getName() + " to " + hall.getHallName() + " for exam " + exam.getSubject().getName())
                .build());

        return mapToDto(assignment);
    }

    @Override
    @Transactional
    public void removeAssignment(Long assignmentId) {
        InvigilatorAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + assignmentId));
        assignmentRepository.delete(assignment);
    }

    private InvigilatorDtos.AssignmentDto mapToDto(InvigilatorAssignment a) {
        long assignedStudents = allocationRepository.findAllByExamIdAndHallId(a.getExam().getId(), a.getHall().getId()).size();
        long present = attendanceRepository.countByExamIdAndStatus(a.getExam().getId(), AttendanceStatus.PRESENT);
        long absent = attendanceRepository.countByExamIdAndStatus(a.getExam().getId(), AttendanceStatus.ABSENT);
        long malpractice = attendanceRepository.countByExamIdAndStatus(a.getExam().getId(), AttendanceStatus.MALPRACTICE);

        return InvigilatorDtos.AssignmentDto.builder()
                .id(a.getId())
                .examId(a.getExam().getId())
                .subjectName(a.getExam().getSubject().getName())
                .subjectCode(a.getExam().getSubject().getCode())
                .examDate(a.getExam().getExamDate())
                .startTime(a.getExam().getStartTime())
                .endTime(a.getExam().getEndTime())
                .invigilatorId(a.getInvigilator().getId())
                .invigilatorName(a.getInvigilator().getName())
                .invigilatorEmail(a.getInvigilator().getEmail())
                .hallId(a.getHall().getId())
                .hallName(a.getHall().getHallName())
                .roomNumber(a.getHall().getRoomNumber())
                .building(a.getHall().getBuilding())
                .status(a.getStatus())
                .assignedStudentsCount(assignedStudents)
                .presentCount(present)
                .absentCount(absent)
                .malpracticeCount(malpractice)
                .assignedAt(a.getAssignedAt())
                .build();
    }
}
