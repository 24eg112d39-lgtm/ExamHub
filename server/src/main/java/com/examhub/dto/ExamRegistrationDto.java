package com.examhub.dto;

import com.examhub.entity.ExamRegistrationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamRegistrationDto {
    private Long id;
    private Long examId;
    private String subjectName;
    private String subjectCode;
    private Long studentId;
    private String studentName;
    private String rollNumber;
    private String registrationNumber;
    private String departmentName;
    private String departmentCode;
    private String section;
    private ExamRegistrationStatus registrationStatus;
    private LocalDateTime registeredAt;
}
