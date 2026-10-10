package com.examhub.repository;

import com.examhub.entity.Attendance;
import com.examhub.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findAllByExamId(Long examId);

    List<Attendance> findAllByExamIdAndHallId(Long examId, Long hallId);

    Optional<Attendance> findByExamIdAndStudentId(Long examId, Long studentId);

    boolean existsByExamIdAndStudentId(Long examId, Long studentId);

    long countByExamIdAndStatus(Long examId, AttendanceStatus status);

    long countByExamId(Long examId);

    void deleteAllByExamId(Long examId);
}
