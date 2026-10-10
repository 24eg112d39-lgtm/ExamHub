package com.examhub.service;

import com.examhub.dto.CreateHallRequest;
import com.examhub.dto.ExamHallDto;
import com.examhub.dto.SeatDto;
import com.examhub.dto.UpdateHallRequest;

import java.util.List;

public interface ExamHallService {
    List<ExamHallDto> getAllHalls(boolean onlyActive);
    ExamHallDto getHallById(Long id);
    ExamHallDto createHall(CreateHallRequest request);
    ExamHallDto updateHall(Long id, UpdateHallRequest request);
    void deleteHall(Long id);
    List<SeatDto> getSeatsByHall(Long hallId);
    SeatDto toggleSeatActive(Long seatId);
    void regenerateSeatsForHall(Long hallId);
}
