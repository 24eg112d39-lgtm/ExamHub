package com.examhub.service;

import com.examhub.entity.*;
import com.examhub.exception.ConflictException;
import com.examhub.repository.*;
import com.examhub.service.impl.ExamServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExamConflictServiceTest {

    @Mock private ExamRepository examRepository;
    @Mock private SubjectRepository subjectRepository;
    @Mock private StudentRepository studentRepository;
    @Mock private ExamRegistrationRepository examRegistrationRepository;
    @Mock private SeatAllocationRepository seatAllocationRepository;

    @InjectMocks
    private ExamServiceImpl examService;

    private Exam exam1;
    private Exam exam2;
    private Student student;

    @BeforeEach
    void setUp() {
        Subject s1 = Subject.builder().id(1L).code("CS301").name("Data Structures").build();
        Subject s2 = Subject.builder().id(2L).code("EC301").name("Digital Electronics").build();

        exam1 = Exam.builder()
                .id(1L)
                .subject(s1)
                .examDate(LocalDate.of(2026, 11, 20))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(13, 0))
                .status(ExamStatus.SCHEDULED)
                .build();

        exam2 = Exam.builder()
                .id(2L)
                .subject(s2)
                .examDate(LocalDate.of(2026, 11, 20))
                .startTime(LocalTime.of(11, 0))
                .endTime(LocalTime.of(14, 0))
                .status(ExamStatus.SCHEDULED)
                .build();

        student = Student.builder()
                .id(101L)
                .name("Aarav Sharma")
                .rollNumber("CS2026001")
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Test 7 — Same Student Exam Conflict: Student has overlapping exams -> 409 CONFLICT")
    void testOverlappingExamStudentConflict() {
        when(examRepository.findById(2L)).thenReturn(Optional.of(exam2));
        when(studentRepository.findById(101L)).thenReturn(Optional.of(student));
        when(examRegistrationRepository.existsByExamIdAndStudentId(2L, 101L)).thenReturn(false);

        // Simulate that the student is already registered for exam1, which overlaps in time
        ExamRegistration conflictingReg = ExamRegistration.builder()
                .exam(exam1)
                .student(student)
                .build();

        when(examRegistrationRepository.findConflictingRegistrations(
                eq(101L),
                eq(exam2.getExamDate()),
                eq(exam2.getStartTime()),
                eq(exam2.getEndTime()),
                eq(2L)
        )).thenReturn(List.of(conflictingReg));

        ConflictException ex = assertThrows(ConflictException.class, () ->
                examService.registerStudents(2L, List.of(101L))
        );

        assertTrue(ex.getMessage().contains("Timetable conflict"));
        assertTrue(ex.getMessage().contains("Aarav Sharma"));
    }
}
