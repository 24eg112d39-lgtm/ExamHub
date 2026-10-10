package com.examhub.service.strategy.impl;

import com.examhub.dto.AllocationStrategyType;
import com.examhub.entity.Seat;
import com.examhub.entity.Student;
import com.examhub.service.strategy.AllocationStrategy;
import com.examhub.service.strategy.StudentSeatPair;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class SectionMixingAllocationStrategy implements AllocationStrategy {

    @Override
    public AllocationStrategyType getType() {
        return AllocationStrategyType.SECTION_MIXING;
    }

    @Override
    public List<StudentSeatPair> allocate(List<Student> students, List<Seat> seats, Long seed) {
        if (students.isEmpty() || seats.isEmpty()) {
            return Collections.emptyList();
        }

        // Group students by section
        Map<String, List<Student>> sectionBuckets = new LinkedHashMap<>();
        for (Student s : students) {
            String key = (s.getDepartment().getCode() + "_" + s.getSection()).toUpperCase();
            sectionBuckets.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }

        if (seed != null) {
            Random rng = new Random(seed);
            for (List<Student> bucket : sectionBuckets.values()) {
                Collections.shuffle(bucket, rng);
            }
        }

        List<Queue<Student>> queues = new ArrayList<>();
        for (List<Student> bucket : sectionBuckets.values()) {
            queues.add(new LinkedList<>(bucket));
        }

        List<Student> interleaved = new ArrayList<>();
        boolean hasMore = true;

        while (hasMore) {
            hasMore = false;
            for (Queue<Student> q : queues) {
                if (!q.isEmpty()) {
                    interleaved.add(q.poll());
                    hasMore = true;
                }
            }
        }

        List<StudentSeatPair> result = new ArrayList<>();
        int count = Math.min(interleaved.size(), seats.size());
        for (int i = 0; i < count; i++) {
            result.add(new StudentSeatPair(interleaved.get(i), seats.get(i)));
        }
        return result;
    }
}
