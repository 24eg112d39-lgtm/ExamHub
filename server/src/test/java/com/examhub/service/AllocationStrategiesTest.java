package com.examhub.service;

import com.examhub.dto.AllocationStrategyType;
import com.examhub.entity.Department;
import com.examhub.entity.ExamHall;
import com.examhub.entity.Seat;
import com.examhub.entity.Student;
import com.examhub.service.strategy.StudentSeatPair;
import com.examhub.service.strategy.impl.DepartmentMixingAllocationStrategy;
import com.examhub.service.strategy.impl.RandomAllocationStrategy;
import com.examhub.service.strategy.impl.SectionMixingAllocationStrategy;
import com.examhub.service.strategy.impl.SequentialAllocationStrategy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AllocationStrategiesTest {

    private List<Student> testStudents;
    private List<Seat> testSeats;
    private Department cseDept;
    private Department eceDept;
    private Department eeeDept;
    private ExamHall hall;

    @BeforeEach
    void setUp() {
        cseDept = Department.builder().id(1L).code("CSE").name("Computer Science").build();
        eceDept = Department.builder().id(2L).code("ECE").name("Electronics").build();
        eeeDept = Department.builder().id(3L).code("EEE").name("Electrical").build();

        hall = ExamHall.builder().id(1L).hallName("Hall 101").building("Main").roomNumber("101").capacity(60).build();

        testStudents = new ArrayList<>();
        // 10 CSE students
        for (int i = 1; i <= 10; i++) {
            testStudents.add(Student.builder()
                    .id((long) i)
                    .rollNumber("CS" + i)
                    .registrationNumber("REG-CS-" + i)
                    .name("CSE Student " + i)
                    .department(cseDept)
                    .section("A")
                    .active(true)
                    .build());
        }
        // 10 ECE students
        for (int i = 11; i <= 20; i++) {
            testStudents.add(Student.builder()
                    .id((long) i)
                    .rollNumber("EC" + i)
                    .registrationNumber("REG-EC-" + i)
                    .name("ECE Student " + i)
                    .department(eceDept)
                    .section("A")
                    .active(true)
                    .build());
        }
        // 10 EEE students
        for (int i = 21; i <= 30; i++) {
            testStudents.add(Student.builder()
                    .id((long) i)
                    .rollNumber("EE" + i)
                    .registrationNumber("REG-EE-" + i)
                    .name("EEE Student " + i)
                    .department(eeeDept)
                    .section("B")
                    .active(true)
                    .build());
        }

        // 40 seats
        testSeats = new ArrayList<>();
        for (int r = 1; r <= 5; r++) {
            char rowChar = (char) ('A' + (r - 1));
            for (int c = 1; c <= 8; c++) {
                testSeats.add(Seat.builder()
                        .id((long) ((r - 1) * 8 + c))
                        .hall(hall)
                        .rowNumber(r)
                        .columnNumber(c)
                        .seatNumber("" + rowChar + c)
                        .active(true)
                        .build());
            }
        }
    }

    @Test
    @DisplayName("Test Sequential Allocation Strategy fills seats sequentially")
    void testSequentialAllocation() {
        SequentialAllocationStrategy strategy = new SequentialAllocationStrategy();
        assertEquals(AllocationStrategyType.SEQUENTIAL, strategy.getType());

        List<StudentSeatPair> pairs = strategy.allocate(testStudents, testSeats, null);
        assertEquals(30, pairs.size());
        assertEquals("CS1", pairs.get(0).getStudent().getRollNumber());
        assertEquals("A1", pairs.get(0).getSeat().getSeatNumber());
        assertEquals("CS2", pairs.get(1).getStudent().getRollNumber());
        assertEquals("A2", pairs.get(1).getSeat().getSeatNumber());
    }

    @Test
    @DisplayName("Test Deterministic Random Allocation - Test 9: Same seed produces identical allocation")
    void testDeterministicRandomAllocation() {
        RandomAllocationStrategy strategy = new RandomAllocationStrategy();
        assertEquals(AllocationStrategyType.RANDOM, strategy.getType());

        long seed = 12345L;
        List<StudentSeatPair> run1 = strategy.allocate(testStudents, testSeats, seed);
        List<StudentSeatPair> run2 = strategy.allocate(testStudents, testSeats, seed);

        assertEquals(run1.size(), run2.size());
        for (int i = 0; i < run1.size(); i++) {
            assertEquals(run1.get(i).getStudent().getRollNumber(), run2.get(i).getStudent().getRollNumber(),
                    "Mismatch at index " + i + " between deterministic runs with same seed");
            assertEquals(run1.get(i).getSeat().getSeatNumber(), run2.get(i).getSeat().getSeatNumber());
        }
    }

    @Test
    @DisplayName("Test Department Mixing Strategy - Test 10: Interleaves departments")
    void testDepartmentMixingAllocation() {
        DepartmentMixingAllocationStrategy strategy = new DepartmentMixingAllocationStrategy();
        assertEquals(AllocationStrategyType.DEPARTMENT_MIXING, strategy.getType());

        List<StudentSeatPair> pairs = strategy.allocate(testStudents, testSeats, 42L);
        assertEquals(30, pairs.size());

        // Verify that consecutive seats alternate departments
        int consecutiveSameDeptCount = 0;
        for (int i = 0; i < pairs.size() - 1; i++) {
            Long dept1 = pairs.get(i).getStudent().getDepartment().getId();
            Long dept2 = pairs.get(i + 1).getStudent().getDepartment().getId();
            if (dept1.equals(dept2)) {
                consecutiveSameDeptCount++;
            }
        }

        // With 10 CSE, 10 ECE, 10 EEE, consecutive same department count should be exactly 0
        assertEquals(0, consecutiveSameDeptCount, "Department mixing should avoid consecutive seats for same department");
    }

    @Test
    @DisplayName("Test Section Mixing Strategy interleaves sections")
    void testSectionMixingAllocation() {
        SectionMixingAllocationStrategy strategy = new SectionMixingAllocationStrategy();
        assertEquals(AllocationStrategyType.SECTION_MIXING, strategy.getType());

        List<StudentSeatPair> pairs = strategy.allocate(testStudents, testSeats, null);
        assertEquals(30, pairs.size());
    }
}
