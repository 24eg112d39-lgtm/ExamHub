package com.examhub.repository;

import com.examhub.entity.SeatAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatAllocationRepository extends JpaRepository<SeatAllocation, Long> {

    List<SeatAllocation> findAllByExamId(Long examId);

    List<SeatAllocation> findAllByExamIdAndHallId(Long examId, Long hallId);

    Optional<SeatAllocation> findByExamIdAndStudentId(Long examId, Long studentId);

    Optional<SeatAllocation> findByExamIdAndHallIdAndSeatId(Long examId, Long hallId, Long seatId);

    boolean existsByExamIdAndStudentId(Long examId, Long studentId);

    boolean existsByExamIdAndHallIdAndSeatId(Long examId, Long hallId, Long seatId);

    long countByExamId(Long examId);

    void deleteAllByExamId(Long examId);
}
