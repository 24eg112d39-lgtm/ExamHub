package com.examhub.service.strategy;

import com.examhub.dto.AllocationStrategyType;
import com.examhub.entity.Seat;
import com.examhub.entity.Student;

import java.util.List;

public interface AllocationStrategy {
    AllocationStrategyType getType();
    List<StudentSeatPair> allocate(List<Student> students, List<Seat> seats, Long seed);
}
