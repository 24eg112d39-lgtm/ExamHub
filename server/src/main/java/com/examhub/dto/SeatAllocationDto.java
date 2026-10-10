package com.examhub.dto;

import com.examhub.entity.AllocationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatAllocationDto {
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
    private Long hallId;
    private String hallName;
    private String building;
    private Integer floor;
    private String roomNumber;
    private Long seatId;
    private String seatNumber;
    private Integer rowNumber;
    private Integer columnNumber;
    private String allocationNumber;
    private AllocationStatus status;
    private LocalDateTime allocatedAt;
}
