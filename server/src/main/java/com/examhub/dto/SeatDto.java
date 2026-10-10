package com.examhub.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatDto {
    private Long id;
    private Long hallId;
    private String hallName;
    private Integer rowNumber;
    private Integer columnNumber;
    private String seatNumber;
    private boolean active;
}
