package com.examhub.service.strategy.impl;

import com.examhub.dto.AllocationStrategyType;
import com.examhub.entity.Seat;
import com.examhub.entity.Student;
import com.examhub.service.strategy.AllocationStrategy;
import com.examhub.service.strategy.StudentSeatPair;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class SequentialAllocationStrategy implements AllocationStrategy {

    @Override
    public AllocationStrategyType getType() {
        return AllocationStrategyType.SEQUENTIAL;
    }

    @Override
    public List<StudentSeatPair> allocate(List<Student> students, List<Seat> seats, Long seed) {
        List<StudentSeatPair> result = new ArrayList<>();
        int count = Math.min(students.size(), seats.size());
        for (int i = 0; i < count; i++) {
            result.add(new StudentSeatPair(students.get(i), seats.get(i)));
        }
        return result;
    }
}
