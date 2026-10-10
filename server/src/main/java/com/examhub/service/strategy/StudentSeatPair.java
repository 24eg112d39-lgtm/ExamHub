package com.examhub.service.strategy;

import com.examhub.entity.Seat;
import com.examhub.entity.Student;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentSeatPair {
    private Student student;
    private Seat seat;
}
