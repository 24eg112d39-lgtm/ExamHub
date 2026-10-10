package com.examhub.repository;

import com.examhub.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByRollNumber(String rollNumber);
    Optional<Student> findByRegistrationNumber(String registrationNumber);
    Optional<Student> findByUserId(Long userId);
    Optional<Student> findByEmail(String email);
    boolean existsByRollNumber(String rollNumber);
    boolean existsByRegistrationNumber(String registrationNumber);
    List<Student> findAllByDepartmentIdAndActiveTrue(Long departmentId);
    List<Student> findAllByActiveTrue();

    @Query("SELECT s FROM Student s WHERE " +
           "(:deptId IS NULL OR s.department.id = :deptId) AND " +
           "(:semester IS NULL OR s.semester = :semester) AND " +
           "(:section IS NULL OR LOWER(s.section) = LOWER(:section)) AND " +
           "(:search IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.rollNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.registrationNumber) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Student> findWithFilters(
            @Param("deptId") Long deptId,
            @Param("semester") Integer semester,
            @Param("section") String section,
            @Param("search") String search,
            Pageable pageable
    );
}
