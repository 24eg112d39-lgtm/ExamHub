package com.examhub.dto;

import com.examhub.entity.ExamStatus;
import com.examhub.entity.ExamType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateExamRequest {
    private Long subjectId;
    private LocalDate examDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer semester;
    private String academicYear;
    private ExamType examType;
    private ExamStatus status;
}
