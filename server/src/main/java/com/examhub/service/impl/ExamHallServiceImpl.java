package com.examhub.service.impl;

import com.examhub.dto.CreateHallRequest;
import com.examhub.dto.ExamHallDto;
import com.examhub.dto.SeatDto;
import com.examhub.dto.UpdateHallRequest;
import com.examhub.entity.ExamHall;
import com.examhub.entity.Seat;
import com.examhub.exception.ConflictException;
import com.examhub.exception.ResourceNotFoundException;
import com.examhub.repository.ExamHallRepository;
import com.examhub.repository.SeatAllocationRepository;
import com.examhub.repository.SeatRepository;
import com.examhub.service.ExamHallService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExamHallServiceImpl implements ExamHallService {

    private final ExamHallRepository hallRepository;
    private final SeatRepository seatRepository;
    private final SeatAllocationRepository allocationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ExamHallDto> getAllHalls(boolean onlyActive) {
        List<ExamHall> list = onlyActive
                ? hallRepository.findAllByActiveTrue()
                : hallRepository.findAll();
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ExamHallDto getHallById(Long id) {
        ExamHall hall = hallRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam hall not found with id: " + id));
        return mapToDto(hall);
    }

    @Override
    @Transactional
    public ExamHallDto createHall(CreateHallRequest request) {
        String building = request.getBuilding().trim();
        String room = request.getRoomNumber().trim();

        if (hallRepository.existsByBuildingAndRoomNumber(building, room)) {
            throw new ConflictException("Hall already exists for building '" + building + "' and room '" + room + "'");
        }

        int capacity = request.getTotalRows() * request.getTotalColumns();

        ExamHall hall = ExamHall.builder()
                .building(building)
                .floor(request.getFloor())
                .roomNumber(room)
                .hallName(request.getHallName().trim())
                .totalRows(request.getTotalRows())
                .totalColumns(request.getTotalColumns())
                .capacity(capacity)
                .active(true)
                .build();

        hall = hallRepository.save(hall);

        // Generate seats automatically
        generateSeatsInternal(hall);

        return mapToDto(hall);
    }

    @Override
    @Transactional
    public ExamHallDto updateHall(Long id, UpdateHallRequest request) {
        ExamHall hall = hallRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam hall not found with id: " + id));

        boolean rowsOrColsChanged = false;

        if (request.getBuilding() != null) {
            hall.setBuilding(request.getBuilding().trim());
        }
        if (request.getFloor() != null) {
            hall.setFloor(request.getFloor());
        }
        if (request.getRoomNumber() != null) {
            String newRoom = request.getRoomNumber().trim();
            if (!newRoom.equalsIgnoreCase(hall.getRoomNumber()) &&
                hallRepository.existsByBuildingAndRoomNumber(hall.getBuilding(), newRoom)) {
                throw new ConflictException("Hall already exists for room '" + newRoom + "' in building '" + hall.getBuilding() + "'");
            }
            hall.setRoomNumber(newRoom);
        }
        if (request.getHallName() != null) {
            hall.setHallName(request.getHallName().trim());
        }
        if (request.getActive() != null) {
            hall.setActive(request.getActive());
        }

        if (request.getTotalRows() != null && !request.getTotalRows().equals(hall.getTotalRows())) {
            hall.setTotalRows(request.getTotalRows());
            rowsOrColsChanged = true;
        }

        if (request.getTotalColumns() != null && !request.getTotalColumns().equals(hall.getTotalColumns())) {
            hall.setTotalColumns(request.getTotalColumns());
            rowsOrColsChanged = true;
        }

        if (rowsOrColsChanged) {
            hall.setCapacity(hall.getTotalRows() * hall.getTotalColumns());
            generateSeatsInternal(hall);
        }

        return mapToDto(hallRepository.save(hall));
    }

    @Override
    @Transactional
    public void deleteHall(Long id) {
        ExamHall hall = hallRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam hall not found with id: " + id));
        hall.setActive(false);
        hallRepository.save(hall);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SeatDto> getSeatsByHall(Long hallId) {
        if (!hallRepository.existsById(hallId)) {
            throw new ResourceNotFoundException("Exam hall not found with id: " + hallId);
        }
        return seatRepository.findAllByHallIdOrderByRowNumberAscColumnNumberAsc(hallId)
                .stream().map(this::mapSeatToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SeatDto toggleSeatActive(Long seatId) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new ResourceNotFoundException("Seat not found with id: " + seatId));
        seat.setActive(!seat.isActive());
        return mapSeatToDto(seatRepository.save(seat));
    }

    @Override
    @Transactional
    public void regenerateSeatsForHall(Long hallId) {
        ExamHall hall = hallRepository.findById(hallId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam hall not found with id: " + hallId));
        generateSeatsInternal(hall);
    }

    private void generateSeatsInternal(ExamHall hall) {
        seatRepository.deleteAllByHallId(hall.getId());

        List<Seat> seats = new ArrayList<>();
        int rows = hall.getTotalRows();
        int cols = hall.getTotalColumns();

        for (int r = 1; r <= rows; r++) {
            char rowChar = (char) ('A' + (r - 1));
            for (int c = 1; c <= cols; c++) {
                String seatNumber = "" + rowChar + c;
                Seat seat = Seat.builder()
                        .hall(hall)
                        .rowNumber(r)
                        .columnNumber(c)
                        .seatNumber(seatNumber)
                        .active(true)
                        .build();
                seats.add(seat);
            }
        }

        seatRepository.saveAll(seats);
        log.info("Generated {} seats for Hall ID {}", seats.size(), hall.getId());
    }

    private ExamHallDto mapToDto(ExamHall h) {
        long totalSeats = seatRepository.countByHallIdAndActiveTrue(h.getId());
        return ExamHallDto.builder()
                .id(h.getId())
                .building(h.getBuilding())
                .floor(h.getFloor())
                .roomNumber(h.getRoomNumber())
                .hallName(h.getHallName())
                .capacity(h.getCapacity())
                .totalRows(h.getTotalRows())
                .totalColumns(h.getTotalColumns())
                .active(h.isActive())
                .totalSeats(h.getCapacity())
                .activeSeats(totalSeats)
                .createdAt(h.getCreatedAt())
                .updatedAt(h.getUpdatedAt())
                .build();
    }

    private SeatDto mapSeatToDto(Seat s) {
        return SeatDto.builder()
                .id(s.getId())
                .hallId(s.getHall().getId())
                .hallName(s.getHall().getHallName())
                .rowNumber(s.getRowNumber())
                .columnNumber(s.getColumnNumber())
                .seatNumber(s.getSeatNumber())
                .active(s.isActive())
                .build();
    }
}
