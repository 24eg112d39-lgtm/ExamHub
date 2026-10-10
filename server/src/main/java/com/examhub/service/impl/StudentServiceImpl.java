package com.examhub.service.impl;

import com.examhub.dto.CreateStudentRequest;
import com.examhub.dto.StudentDto;
import com.examhub.dto.StudentImportResultDto;
import com.examhub.dto.UpdateStudentRequest;
import com.examhub.entity.Department;
import com.examhub.entity.Student;
import com.examhub.exception.ConflictException;
import com.examhub.exception.ResourceNotFoundException;
import com.examhub.repository.DepartmentRepository;
import com.examhub.repository.StudentRepository;
import com.examhub.service.StudentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    @Override
    @Transactional(readOnly = true)
    public Page<StudentDto> getStudents(Long deptId, Integer semester, String section, String search, Pageable pageable) {
        String cleanSearch = StringUtils.hasText(search) ? search.trim() : null;
        String cleanSection = StringUtils.hasText(section) ? section.trim() : null;
        return studentRepository.findWithFilters(deptId, semester, cleanSection, cleanSearch, pageable)
                .map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentDto> getAllActiveStudents() {
        return studentRepository.findAllByActiveTrue().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public StudentDto getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        return mapToDto(student);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentDto getStudentByUserId(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found for user id: " + userId));
        return mapToDto(student);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentDto getStudentByRollNumber(String rollNumber) {
        Student student = studentRepository.findByRollNumber(rollNumber.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with roll number: " + rollNumber));
        return mapToDto(student);
    }

    @Override
    @Transactional
    public StudentDto createStudent(CreateStudentRequest request) {
        String rollNumber = request.getRollNumber().trim().toUpperCase();
        if (studentRepository.existsByRollNumber(rollNumber)) {
            throw new ConflictException("Student with roll number '" + rollNumber + "' already exists");
        }

        String regNumber = request.getRegistrationNumber().trim().toUpperCase();
        if (studentRepository.existsByRegistrationNumber(regNumber)) {
            throw new ConflictException("Student with registration number '" + regNumber + "' already exists");
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));

        Student student = Student.builder()
                .rollNumber(rollNumber)
                .registrationNumber(regNumber)
                .name(request.getName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .phone(request.getPhone())
                .department(department)
                .section(request.getSection().trim().toUpperCase())
                .semester(request.getSemester())
                .academicYear(request.getAcademicYear())
                .active(true)
                .build();

        return mapToDto(studentRepository.save(student));
    }

    @Override
    @Transactional
    public StudentDto updateStudent(Long id, UpdateStudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        if (request.getRollNumber() != null) {
            String newRoll = request.getRollNumber().trim().toUpperCase();
            if (!newRoll.equalsIgnoreCase(student.getRollNumber()) && studentRepository.existsByRollNumber(newRoll)) {
                throw new ConflictException("Student with roll number '" + newRoll + "' already exists");
            }
            student.setRollNumber(newRoll);
        }

        if (request.getRegistrationNumber() != null) {
            String newReg = request.getRegistrationNumber().trim().toUpperCase();
            if (!newReg.equalsIgnoreCase(student.getRegistrationNumber()) && studentRepository.existsByRegistrationNumber(newReg)) {
                throw new ConflictException("Student with registration number '" + newReg + "' already exists");
            }
            student.setRegistrationNumber(newReg);
        }

        if (request.getName() != null) {
            student.setName(request.getName().trim());
        }

        if (request.getEmail() != null) {
            student.setEmail(request.getEmail().trim().toLowerCase());
        }

        if (request.getPhone() != null) {
            student.setPhone(request.getPhone());
        }

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));
            student.setDepartment(department);
        }

        if (request.getSection() != null) {
            student.setSection(request.getSection().trim().toUpperCase());
        }

        if (request.getSemester() != null) {
            student.setSemester(request.getSemester());
        }

        if (request.getAcademicYear() != null) {
            student.setAcademicYear(request.getAcademicYear());
        }

        if (request.getActive() != null) {
            student.setActive(request.getActive());
        }

        return mapToDto(studentRepository.save(student));
    }

    @Override
    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        student.setActive(false);
        studentRepository.save(student);
    }

    @Override
    @Transactional
    public StudentImportResultDto importStudentsFromCsv(String csvContent) {
        if (!StringUtils.hasText(csvContent)) {
            return StudentImportResultDto.builder().totalRows(0).imported(0).failed(0).errors(List.of()).build();
        }

        String[] lines = csvContent.split("\\r?\\n");
        if (lines.length <= 1) {
            return StudentImportResultDto.builder().totalRows(0).imported(0).failed(0).errors(List.of()).build();
        }

        // Parse header
        String headerLine = lines[0];
        String[] headers = parseCsvLine(headerLine);
        Map<String, Integer> colIndex = new HashMap<>();
        for (int i = 0; i < headers.length; i++) {
            colIndex.put(headers[i].trim().toLowerCase().replace("_", ""), i);
        }

        // Required headers
        String[] requiredKeys = {"rollnumber", "registrationnumber", "name", "email", "department", "section", "semester", "year"};
        for (String req : requiredKeys) {
            if (!colIndex.containsKey(req)) {
                throw new ConflictException("CSV is missing required header: " + req + ". Expected headers: rollNumber,registrationNumber,name,email,department,section,semester,year");
            }
        }

        // Preload departments cache
        Map<String, Department> deptMap = departmentRepository.findAll().stream()
                .collect(Collectors.toMap(d -> d.getCode().toUpperCase(), d -> d, (a, b) -> a));

        List<StudentImportResultDto.RowError> errors = new ArrayList<>();
        List<Student> studentsToSave = new ArrayList<>();
        Set<String> seenRolls = new HashSet<>();
        Set<String> seenRegs = new HashSet<>();

        int totalDataRows = lines.length - 1;

        for (int i = 1; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) {
                continue;
            }

            int rowNumber = i + 1; // 1-indexed for human readability
            String[] fields = parseCsvLine(line);

            try {
                String roll = getField(fields, colIndex.get("rollnumber"));
                String reg = getField(fields, colIndex.get("registrationnumber"));
                String name = getField(fields, colIndex.get("name"));
                String email = getField(fields, colIndex.get("email"));
                String deptCode = getField(fields, colIndex.get("department"));
                String section = getField(fields, colIndex.get("section"));
                String semStr = getField(fields, colIndex.get("semester"));
                String yearStr = getField(fields, colIndex.get("year"));
                String phone = colIndex.containsKey("phone") ? getField(fields, colIndex.get("phone")) : null;

                if (!StringUtils.hasText(roll) || !StringUtils.hasText(reg) || !StringUtils.hasText(name) || !StringUtils.hasText(email)) {
                    errors.add(new StudentImportResultDto.RowError(rowNumber, roll, "Required fields (roll, registration, name, email) cannot be blank"));
                    continue;
                }

                roll = roll.trim().toUpperCase();
                reg = reg.trim().toUpperCase();

                if (!EMAIL_PATTERN.matcher(email.trim()).matches()) {
                    errors.add(new StudentImportResultDto.RowError(rowNumber, roll, "Invalid email format: " + email));
                    continue;
                }

                if (seenRolls.contains(roll) || studentRepository.existsByRollNumber(roll)) {
                    errors.add(new StudentImportResultDto.RowError(rowNumber, roll, "Duplicate roll number: " + roll));
                    continue;
                }

                if (seenRegs.contains(reg) || studentRepository.existsByRegistrationNumber(reg)) {
                    errors.add(new StudentImportResultDto.RowError(rowNumber, reg, "Duplicate registration number: " + reg));
                    continue;
                }

                Department dept = deptMap.get(deptCode.trim().toUpperCase());
                if (dept == null) {
                    errors.add(new StudentImportResultDto.RowError(rowNumber, roll, "Invalid department code: " + deptCode));
                    continue;
                }

                int semester;
                try {
                    semester = Integer.parseInt(semStr.trim());
                    if (semester < 1 || semester > 12) {
                        errors.add(new StudentImportResultDto.RowError(rowNumber, roll, "Semester must be between 1 and 12"));
                        continue;
                    }
                } catch (NumberFormatException e) {
                    errors.add(new StudentImportResultDto.RowError(rowNumber, roll, "Invalid semester number: " + semStr));
                    continue;
                }

                int year;
                try {
                    year = Integer.parseInt(yearStr.trim());
                } catch (NumberFormatException e) {
                    errors.add(new StudentImportResultDto.RowError(rowNumber, roll, "Invalid academic year number: " + yearStr));
                    continue;
                }

                Student student = Student.builder()
                        .rollNumber(roll)
                        .registrationNumber(reg)
                        .name(name.trim())
                        .email(email.trim().toLowerCase())
                        .phone(phone)
                        .department(dept)
                        .section(section.trim().toUpperCase())
                        .semester(semester)
                        .academicYear(year)
                        .active(true)
                        .build();

                studentsToSave.add(student);
                seenRolls.add(roll);
                seenRegs.add(reg);

            } catch (Exception ex) {
                errors.add(new StudentImportResultDto.RowError(rowNumber, "Row " + rowNumber, "Parsing error: " + ex.getMessage()));
            }
        }

        if (!studentsToSave.isEmpty()) {
            studentRepository.saveAll(studentsToSave);
        }

        return StudentImportResultDto.builder()
                .totalRows(totalDataRows)
                .imported(studentsToSave.size())
                .failed(errors.size())
                .errors(errors)
                .build();
    }

    private String[] parseCsvLine(String line) {
        List<String> tokens = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        boolean inQuotes = false;
        for (char c : line.toCharArray()) {
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                tokens.add(sb.toString().trim().replaceAll("^\"|\"$", ""));
                sb.setLength(0);
            } else {
                sb.append(c);
            }
        }
        tokens.add(sb.toString().trim().replaceAll("^\"|\"$", ""));
        return tokens.toArray(new String[0]);
    }

    private String getField(String[] fields, Integer idx) {
        if (idx == null || idx < 0 || idx >= fields.length) {
            return "";
        }
        return fields[idx];
    }

    private StudentDto mapToDto(Student s) {
        return StudentDto.builder()
                .id(s.getId())
                .userId(s.getUser() != null ? s.getUser().getId() : null)
                .rollNumber(s.getRollNumber())
                .registrationNumber(s.getRegistrationNumber())
                .name(s.getName())
                .email(s.getEmail())
                .phone(s.getPhone())
                .departmentId(s.getDepartment().getId())
                .departmentName(s.getDepartment().getName())
                .departmentCode(s.getDepartment().getCode())
                .section(s.getSection())
                .semester(s.getSemester())
                .academicYear(s.getAcademicYear())
                .active(s.isActive())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
