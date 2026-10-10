package com.examhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamHallDto {
    private Long id;
    private String building;
    private Integer floor;
    private String roomNumber;
    private String hallName;
    private Integer capacity;
    private Integer totalRows;
    private Integer totalColumns;
    private boolean active;
    private long totalSeats;
    private long activeSeats;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
