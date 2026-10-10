package com.examhub.repository;

import com.examhub.entity.ExamRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExamRegistrationRepository extends JpaRepository<ExamRegistration, Long> {

    List<ExamRegistration> findAllByExamId(Long examId);

    Optional<ExamRegistration> findByExamIdAndStudentId(Long examId, Long studentId);

    boolean existsByExamIdAndStudentId(Long examId, Long studentId);

    long countByExamId(Long examId);

    void deleteAllByExamId(Long examId);

    @Query("SELECT er FROM ExamRegistration er " +
           "JOIN er.exam e " +
           "WHERE er.student.id = :studentId " +
           "AND e.examDate = :examDate " +
           "AND (:excludeExamId IS NULL OR e.id <> :excludeExamId) " +
           "AND e.status NOT IN ('CANCELLED') " +
           "AND (e.startTime < :endTime AND :startTime < e.endTime)")
    List<ExamRegistration> findConflictingRegistrations(
            @Param("studentId") Long studentId,
            @Param("examDate") LocalDate examDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeExamId") Long excludeExamId
    );
}
