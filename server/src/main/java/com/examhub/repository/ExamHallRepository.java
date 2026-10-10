package com.examhub.repository;

import com.examhub.entity.ExamHall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExamHallRepository extends JpaRepository<ExamHall, Long> {

    List<ExamHall> findAllByActiveTrue();

    Optional<ExamHall> findByBuildingAndRoomNumber(String building, String roomNumber);

    boolean existsByBuildingAndRoomNumber(String building, String roomNumber);

    @Query("SELECT DISTINCT sa.hall FROM SeatAllocation sa " +
           "JOIN sa.exam e " +
           "WHERE sa.hall.id = :hallId " +
           "AND e.examDate = :examDate " +
           "AND (:excludeExamId IS NULL OR e.id <> :excludeExamId) " +
           "AND e.status NOT IN ('CANCELLED') " +
           "AND (e.startTime < :endTime AND :startTime < e.endTime)")
    List<ExamHall> findConflictingAllocatedHalls(
            @Param("hallId") Long hallId,
            @Param("examDate") LocalDate examDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeExamId") Long excludeExamId
    );
}
