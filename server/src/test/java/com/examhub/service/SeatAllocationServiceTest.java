package com.examhub.service;

import com.examhub.dto.AllocationResponse;
import com.examhub.dto.AllocationStrategyType;
import com.examhub.dto.GenerateAllocationRequest;
import com.examhub.entity.*;
import com.examhub.exception.ConflictException;
import com.examhub.repository.*;
import com.examhub.service.impl.SeatAllocationServiceImpl;
import com.examhub.service.strategy.impl.DepartmentMixingAllocationStrategy;
import com.examhub.service.strategy.impl.RandomAllocationStrategy;
import com.examhub.service.strategy.impl.SectionMixingAllocationStrategy;
import com.examhub.service.strategy.impl.SequentialAllocationStrategy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SeatAllocationServiceTest {

    @Mock private ExamRepository examRepository;
    @Mock private StudentRepository studentRepository;
    @Mock private ExamRegistrationRepository registrationRepository;
    @Mock private ExamHallRepository hallRepository;
    @Mock private SeatRepository seatRepository;
    @Mock private SeatAllocationRepository allocationRepository;
    @Mock private NotificationRepository notificationRepository;
    @Mock private AuditLogRepository auditLogRepository;

    private SeatAllocationService allocationService;

    private Exam testExam;
    private ExamHall activeHall;
    private ExamHall inactiveHall;
    private List<Student> students100;
    private List<Seat> seats120;
    private List<Seat> seats50;

    @BeforeEach
    void setUp() {
        allocationService = new SeatAllocationServiceImpl(
                examRepository,
                studentRepository,
                registrationRepository,
                hallRepository,
                seatRepository,
                allocationRepository,
                notificationRepository,
                auditLogRepository,
                List.of(
                        new SequentialAllocationStrategy(),
                        new DepartmentMixingAllocationStrategy(),
                        new SectionMixingAllocationStrategy(),
                        new RandomAllocationStrategy()
                )
        );

        Subject subject = Subject.builder().id(1L).code("CS301").name("Data Structures").build();

        testExam = Exam.builder()
                .id(10L)
                .subject(subject)
                .examDate(LocalDate.of(2026, 11, 20))
                .startTime(LocalTime.of(10, 0))
                .endTime(LocalTime.of(13, 0))
                .durationMinutes(180)
                .semester(3)
                .academicYear("2026-2027")
                .examType(ExamType.END_SEMESTER)
                .status(ExamStatus.SCHEDULED)
                .build();

        activeHall = ExamHall.builder()
                .id(1L)
                .hallName("Hall 101")
                .building("Main Block")
                .roomNumber("101")
                .capacity(120)
                .totalRows(12)
                .totalColumns(10)
                .active(true)
                .build();

        inactiveHall = ExamHall.builder()
                .id(2L)
                .hallName("Hall 201")
                .building("Old Block")
                .roomNumber("201")
                .capacity(50)
                .totalRows(5)
                .totalColumns(10)
                .active(false)
                .build();

        Department dept = Department.builder().id(1L).code("CSE").name("Computer Science").build();

        // 100 students
        students100 = new ArrayList<>();
        List<ExamRegistration> reg100 = new ArrayList<>();
        for (int i = 1; i <= 100; i++) {
            Student s = Student.builder()
                    .id((long) i)
                    .rollNumber("CS" + i)
                    .registrationNumber("REG-" + i)
                    .name("Student " + i)
                    .department(dept)
                    .section("A")
                    .active(true)
                    .build();
            students100.add(s);
            reg100.add(ExamRegistration.builder().exam(testExam).student(s).registrationStatus(ExamRegistrationStatus.REGISTERED).build());
        }

        // 120 seats
        seats120 = new ArrayList<>();
        for (int i = 1; i <= 120; i++) {
            seats120.add(Seat.builder()
                    .id((long) i)
                    .hall(activeHall)
                    .rowNumber((i - 1) / 10 + 1)
                    .columnNumber((i - 1) % 10 + 1)
                    .seatNumber("S" + i)
                    .active(true)
                    .build());
        }

        // 50 seats
        seats50 = new ArrayList<>();
        for (int i = 1; i <= 50; i++) {
            seats50.add(Seat.builder()
                    .id((long) i)
                    .hall(activeHall)
                    .rowNumber((i - 1) / 10 + 1)
                    .columnNumber((i - 1) % 10 + 1)
                    .seatNumber("S" + i)
                    .active(true)
                    .build());
        }
    }

    @Test
    @DisplayName("Test 1 — Enough Capacity: 100 students, 120 seats -> SUCCESS, Allocated: 100")
    void testEnoughCapacityAllocation() {
        when(examRepository.findById(10L)).thenReturn(Optional.of(testExam));
        when(registrationRepository.findAllByExamId(10L)).thenReturn(
                students100.stream().map(s -> ExamRegistration.builder().exam(testExam).student(s).build()).toList()
        );
        when(hallRepository.findById(1L)).thenReturn(Optional.of(activeHall));
        when(hallRepository.findConflictingAllocatedHalls(eq(1L), any(), any(), any(), eq(10L))).thenReturn(List.of());
        when(seatRepository.findAllByHallIdAndActiveTrueOrderByRowNumberAscColumnNumberAsc(1L)).thenReturn(seats120);

        GenerateAllocationRequest request = GenerateAllocationRequest.builder()
                .examId(10L)
                .strategy(AllocationStrategyType.SEQUENTIAL)
                .hallIds(List.of(1L))
                .build();

        AllocationResponse response = allocationService.generateAllocation(request);

        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());
        assertEquals(100, response.getStudentsAllocated());
        assertEquals(1, response.getHallsUsed());
        assertEquals(100, response.getSeatsUsed());
        assertEquals(ExamStatus.ALLOCATION_GENERATED, testExam.getStatus());

        verify(allocationRepository).deleteAllByExamId(10L);
        verify(allocationRepository).saveAll(any());
    }

    @Test
    @DisplayName("Test 2 — Insufficient Capacity: 100 students, 50 seats -> 409 CONFLICT, No partial allocation")
    void testInsufficientCapacityAllocation() {
        when(examRepository.findById(10L)).thenReturn(Optional.of(testExam));
        when(registrationRepository.findAllByExamId(10L)).thenReturn(
                students100.stream().map(s -> ExamRegistration.builder().exam(testExam).student(s).build()).toList()
        );
        when(hallRepository.findById(1L)).thenReturn(Optional.of(activeHall));
        when(hallRepository.findConflictingAllocatedHalls(eq(1L), any(), any(), any(), eq(10L))).thenReturn(List.of());
        when(seatRepository.findAllByHallIdAndActiveTrueOrderByRowNumberAscColumnNumberAsc(1L)).thenReturn(seats50);

        GenerateAllocationRequest request = GenerateAllocationRequest.builder()
                .examId(10L)
                .strategy(AllocationStrategyType.SEQUENTIAL)
                .hallIds(List.of(1L))
                .build();

        ConflictException ex = assertThrows(ConflictException.class, () -> allocationService.generateAllocation(request));
        assertTrue(ex.getMessage().contains("Insufficient examination hall capacity"));

        verify(allocationRepository, never()).saveAll(any());
    }

    @Test
    @DisplayName("Test 5 — Inactive Hall: Hall inactive -> rejected")
    void testInactiveHallRejected() {
        when(examRepository.findById(10L)).thenReturn(Optional.of(testExam));
        when(registrationRepository.findAllByExamId(10L)).thenReturn(
                students100.stream().map(s -> ExamRegistration.builder().exam(testExam).student(s).build()).toList()
        );
        when(hallRepository.findById(2L)).thenReturn(Optional.of(inactiveHall));

        GenerateAllocationRequest request = GenerateAllocationRequest.builder()
                .examId(10L)
                .strategy(AllocationStrategyType.SEQUENTIAL)
                .hallIds(List.of(2L))
                .build();

        ConflictException ex = assertThrows(ConflictException.class, () -> allocationService.generateAllocation(request));
        assertTrue(ex.getMessage().contains("inactive"));
    }

    @Test
    @DisplayName("Test 8 — Hall Exam Conflict: Same hall assigned to overlapping exam -> 409 CONFLICT")
    void testHallScheduleConflict() {
        when(examRepository.findById(10L)).thenReturn(Optional.of(testExam));
        when(registrationRepository.findAllByExamId(10L)).thenReturn(
                students100.stream().map(s -> ExamRegistration.builder().exam(testExam).student(s).build()).toList()
        );
        when(hallRepository.findById(1L)).thenReturn(Optional.of(activeHall));
        when(hallRepository.findConflictingAllocatedHalls(eq(1L), any(), any(), any(), eq(10L)))
                .thenReturn(List.of(activeHall)); // Conflicting exam using this hall!

        GenerateAllocationRequest request = GenerateAllocationRequest.builder()
                .examId(10L)
                .strategy(AllocationStrategyType.SEQUENTIAL)
                .hallIds(List.of(1L))
                .build();

        ConflictException ex = assertThrows(ConflictException.class, () -> allocationService.generateAllocation(request));
        assertTrue(ex.getMessage().contains("already occupied"));
    }

    @Test
    @DisplayName("Test 6 — Published Allocation: Cannot be modified after publication")
    void testPublishedAllocationLocked() {
        testExam.setStatus(ExamStatus.PUBLISHED);
        when(examRepository.findById(10L)).thenReturn(Optional.of(testExam));

        GenerateAllocationRequest request = GenerateAllocationRequest.builder()
                .examId(10L)
                .strategy(AllocationStrategyType.SEQUENTIAL)
                .hallIds(List.of(1L))
                .build();

        ConflictException ex = assertThrows(ConflictException.class, () -> allocationService.generateAllocation(request));
        assertTrue(ex.getMessage().contains("cannot be modified after publication"));
    }
}
