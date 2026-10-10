package com.examhub.dto;

import com.examhub.entity.ExamStatus;
import com.examhub.entity.ExamType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamDto {
    private Long id;
    private Long subjectId;
    private String subjectCode;
    private String subjectName;
    private Long departmentId;
    private String departmentName;
    private LocalDate examDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer durationMinutes;
    private Integer semester;
    private String academicYear;
    private ExamType examType;
    private ExamStatus status;
    private long registeredStudentsCount;
    private long allocatedStudentsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
