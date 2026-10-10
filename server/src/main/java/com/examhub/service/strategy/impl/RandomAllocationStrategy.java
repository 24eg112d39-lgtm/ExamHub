package com.examhub.service.strategy.impl;

import com.examhub.dto.AllocationStrategyType;
import com.examhub.entity.Seat;
import com.examhub.entity.Student;
import com.examhub.service.strategy.AllocationStrategy;
import com.examhub.service.strategy.StudentSeatPair;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

@Component
public class RandomAllocationStrategy implements AllocationStrategy {

    @Override
    public AllocationStrategyType getType() {
        return AllocationStrategyType.RANDOM;
    }

    @Override
    public List<StudentSeatPair> allocate(List<Student> students, List<Seat> seats, Long seed) {
        List<Student> shuffledStudents = new ArrayList<>(students);

        if (seed != null) {
            Collections.shuffle(shuffledStudents, new Random(seed));
        } else {
            Collections.shuffle(shuffledStudents);
        }

        List<StudentSeatPair> result = new ArrayList<>();
        int count = Math.min(shuffledStudents.size(), seats.size());
        for (int i = 0; i < count; i++) {
            result.add(new StudentSeatPair(shuffledStudents.get(i), seats.get(i)));
        }
        return result;
    }
}
