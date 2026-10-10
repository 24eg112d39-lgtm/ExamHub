package com.examhub.repository;

import com.examhub.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findAllByHallIdAndActiveTrueOrderByRowNumberAscColumnNumberAsc(Long hallId);

    List<Seat> findAllByHallIdOrderByRowNumberAscColumnNumberAsc(Long hallId);

    Optional<Seat> findByHallIdAndSeatNumber(Long hallId, String seatNumber);

    boolean existsByHallIdAndSeatNumber(Long hallId, String seatNumber);

    long countByHallIdAndActiveTrue(Long hallId);

    void deleteAllByHallId(Long hallId);
}
