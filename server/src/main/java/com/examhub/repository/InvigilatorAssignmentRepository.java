package com.examhub.repository;

import com.examhub.entity.InvigilatorAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvigilatorAssignmentRepository extends JpaRepository<InvigilatorAssignment, Long> {

    List<InvigilatorAssignment> findAllByExamId(Long examId);

    List<InvigilatorAssignment> findAllByInvigilatorId(Long invigilatorId);

    Optional<InvigilatorAssignment> findByExamIdAndHallId(Long examId, Long hallId);

    Optional<InvigilatorAssignment> findByExamIdAndInvigilatorId(Long examId, Long invigilatorId);

    boolean existsByExamIdAndHallId(Long examId, Long hallId);

    @Query("SELECT ia FROM InvigilatorAssignment ia " +
           "JOIN ia.exam e " +
           "WHERE ia.invigilator.id = :invigilatorId " +
           "AND e.examDate = :examDate " +
           "AND (:excludeExamId IS NULL OR e.id <> :excludeExamId) " +
           "AND e.status NOT IN ('CANCELLED') " +
           "AND (e.startTime < :endTime AND :startTime < e.endTime)")
    List<InvigilatorAssignment> findConflictingAssignments(
            @Param("invigilatorId") Long invigilatorId,
            @Param("examDate") LocalDate examDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeExamId") Long excludeExamId
    );
}
