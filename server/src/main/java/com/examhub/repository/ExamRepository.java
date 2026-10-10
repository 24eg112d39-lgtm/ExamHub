package com.examhub.repository;

import com.examhub.entity.Exam;
import com.examhub.entity.ExamStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {

    List<Exam> findAllByStatus(ExamStatus status);

    List<Exam> findAllByExamDateGreaterThanEqualOrderByExamDateAscStartTimeAsc(LocalDate date);

    @Query("SELECT e FROM Exam e WHERE e.examDate = :examDate AND " +
           "(:excludeExamId IS NULL OR e.id <> :excludeExamId) AND " +
           "e.status NOT IN ('CANCELLED') AND " +
           "(e.startTime < :endTime AND :startTime < e.endTime)")
    List<Exam> findOverlappingExams(
            @Param("examDate") LocalDate examDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeExamId") Long excludeExamId
    );

    @Query("SELECT e FROM Exam e JOIN ExamRegistration er ON er.exam.id = e.id " +
           "WHERE er.student.id = :studentId " +
           "ORDER BY e.examDate ASC, e.startTime ASC")
    List<Exam> findExamsForStudent(@Param("studentId") Long studentId);

    @Query("SELECT e FROM Exam e JOIN InvigilatorAssignment ia ON ia.exam.id = e.id " +
           "WHERE ia.invigilator.id = :invigilatorId " +
           "ORDER BY e.examDate ASC, e.startTime ASC")
    List<Exam> findExamsForInvigilator(@Param("invigilatorId") Long invigilatorId);
}
