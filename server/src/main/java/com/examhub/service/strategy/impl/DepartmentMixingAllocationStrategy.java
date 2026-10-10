package com.examhub.service.strategy.impl;

import com.examhub.dto.AllocationStrategyType;
import com.examhub.entity.Seat;
import com.examhub.entity.Student;
import com.examhub.service.strategy.AllocationStrategy;
import com.examhub.service.strategy.StudentSeatPair;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class DepartmentMixingAllocationStrategy implements AllocationStrategy {

    @Override
    public AllocationStrategyType getType() {
        return AllocationStrategyType.DEPARTMENT_MIXING;
    }

    @Override
    public List<StudentSeatPair> allocate(List<Student> students, List<Seat> seats, Long seed) {
        if (students.isEmpty() || seats.isEmpty()) {
            return Collections.emptyList();
        }

        // Group students by Department
        Map<Long, List<Student>> deptBuckets = new LinkedHashMap<>();
        for (Student s : students) {
            deptBuckets.computeIfAbsent(s.getDepartment().getId(), k -> new ArrayList<>()).add(s);
        }

        // If seed is provided, shuffle students within buckets deterministically
        if (seed != null) {
            Random rng = new Random(seed);
            for (List<Student> bucket : deptBuckets.values()) {
                Collections.shuffle(bucket, rng);
            }
        }

        // Interleave across departments using round-robin / largest bucket priority
        List<Student> interleaved = interleaveBuckets(new ArrayList<>(deptBuckets.values()));

        List<StudentSeatPair> result = new ArrayList<>();
        int count = Math.min(interleaved.size(), seats.size());
        for (int i = 0; i < count; i++) {
            result.add(new StudentSeatPair(interleaved.get(i), seats.get(i)));
        }
        return result;
    }

    private List<Student> interleaveBuckets(List<List<Student>> buckets) {
        List<Student> result = new ArrayList<>();

        // Sort departments by size descending initially
        buckets.sort((a, b) -> Integer.compare(b.size(), a.size()));

        List<Queue<Student>> queues = new ArrayList<>();
        for (List<Student> bucket : buckets) {
            queues.add(new LinkedList<>(bucket));
        }

        Long lastDeptId = null;

        while (true) {
            // Find a queue whose student belongs to a department different from lastDeptId
            Queue<Student> bestQueue = null;
            int maxRemaining = -1;

            // First pass: try to pick from a different department, prioritizing queue with most remaining students
            for (Queue<Student> q : queues) {
                if (!q.isEmpty()) {
                    Student candidate = q.peek();
                    if (!Objects.equals(candidate.getDepartment().getId(), lastDeptId)) {
                        if (q.size() > maxRemaining) {
                            maxRemaining = q.size();
                            bestQueue = q;
                        }
                    }
                }
            }

            // Fallback: if all available queues are from the same department (when one department dominates)
            if (bestQueue == null) {
                for (Queue<Student> q : queues) {
                    if (!q.isEmpty()) {
                        bestQueue = q;
                        break;
                    }
                }
            }

            if (bestQueue == null) {
                break; // All queues empty
            }

            Student chosen = bestQueue.poll();
            result.add(chosen);
            lastDeptId = chosen.getDepartment().getId();
        }

        return result;
    }
}
