-- ExamHub Flyway Migration V2: Seed Data

-- 1. USERS
-- Admin: admin@examhub.com / Admin@123
INSERT INTO users (id, name, email, password, phone, role, enabled, created_at, updated_at)
VALUES (1, 'System Administrator', 'admin@examhub.com', '$2a$10$vMWAU6QCFJl.sZNy/HMOg.jy24WrPjvXjnxFXO18f6TLDKjyAysM2', '+91 9876543210', 'ADMIN', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Invigilators: Password@123
INSERT INTO users (id, name, email, password, phone, role, enabled, created_at, updated_at) VALUES
(2, 'Dr. Ramesh Sharma', 'ramesh@examhub.com', '$2a$10$OSVLhzzLTVHBdGhT0DunVOBFYC9VIaHXj3qcXwD9p43E/iASZhr4m', '+91 9876543211', 'INVIGILATOR', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Prof. Anita Desai', 'anita@examhub.com', '$2a$10$OSVLhzzLTVHBdGhT0DunVOBFYC9VIaHXj3qcXwD9p43E/iASZhr4m', '+91 9876543212', 'INVIGILATOR', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Dr. Vikram Patel', 'vikram@examhub.com', '$2a$10$OSVLhzzLTVHBdGhT0DunVOBFYC9VIaHXj3qcXwD9p43E/iASZhr4m', '+91 9876543213', 'INVIGILATOR', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Prof. Sunita Rao', 'sunita@examhub.com', '$2a$10$OSVLhzzLTVHBdGhT0DunVOBFYC9VIaHXj3qcXwD9p43E/iASZhr4m', '+91 9876543214', 'INVIGILATOR', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Sample Student Users (Password@123)
INSERT INTO users (id, name, email, password, phone, role, enabled, created_at, updated_at) VALUES
(101, 'Aarav Sharma', 'aarav.cs@examhub.com', '$2a$10$OSVLhzzLTVHBdGhT0DunVOBFYC9VIaHXj3qcXwD9p43E/iASZhr4m', '+91 9123450001', 'STUDENT', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(102, 'Diya Patel', 'diya.ec@examhub.com', '$2a$10$OSVLhzzLTVHBdGhT0DunVOBFYC9VIaHXj3qcXwD9p43E/iASZhr4m', '+91 9123450002', 'STUDENT', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(103, 'Rohan Verma', 'rohan.ee@examhub.com', '$2a$10$OSVLhzzLTVHBdGhT0DunVOBFYC9VIaHXj3qcXwD9p43E/iASZhr4m', '+91 9123450003', 'STUDENT', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. DEPARTMENTS
INSERT INTO departments (id, name, code, description, active, created_at, updated_at) VALUES
(1, 'Computer Science & Engineering', 'CSE', 'Department of Computer Science and Engineering', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Electronics & Communication Engineering', 'ECE', 'Department of Electronics and Communication Engineering', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Electrical & Electronics Engineering', 'EEE', 'Department of Electrical and Electronics Engineering', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'Mechanical Engineering', 'MECH', 'Department of Mechanical Engineering', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'Civil Engineering', 'CIVIL', 'Department of Civil Engineering', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. SUBJECTS
INSERT INTO subjects (id, code, name, department_id, semester, credits, active, created_at, updated_at) VALUES
(1, 'CS301', 'Data Structures & Algorithms', 1, 3, 4, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'CS302', 'Database Management Systems', 1, 3, 4, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'EC301', 'Digital Electronics', 2, 3, 4, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 'EE301', 'Electric Circuits & Networks', 3, 3, 3, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 'ME301', 'Applied Thermodynamics', 4, 3, 3, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 'CE301', 'Structural Analysis', 5, 3, 4, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. STUDENTS (60 Students: 12 per department)
-- CSE Students (IDs 1-12)
INSERT INTO students (id, user_id, roll_number, registration_number, name, email, phone, department_id, section, semester, academic_year, active, created_at, updated_at) VALUES
(1, 101, 'CS2026001', 'REG-CS-001', 'Aarav Sharma', 'aarav.cs@examhub.com', '+91 9123450001', 1, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, NULL, 'CS2026002', 'REG-CS-002', 'Aditi Rao', 'aditi.cs@examhub.com', '+91 9123450002', 1, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, NULL, 'CS2026003', 'REG-CS-003', 'Ananya Gupta', 'ananya.cs@examhub.com', '+91 9123450003', 1, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, NULL, 'CS2026004', 'REG-CS-004', 'Dev Kumar', 'dev.cs@examhub.com', '+91 9123450004', 1, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, NULL, 'CS2026005', 'REG-CS-005', 'Ishaan Joshi', 'ishaan.cs@examhub.com', '+91 9123450005', 1, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, NULL, 'CS2026006', 'REG-CS-006', 'Kavya Nair', 'kavya.cs@examhub.com', '+91 9123450006', 1, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(7, NULL, 'CS2026007', 'REG-CS-007', 'Manish Reddy', 'manish.cs@examhub.com', '+91 9123450007', 1, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(8, NULL, 'CS2026008', 'REG-CS-008', 'Neha Sen', 'neha.cs@examhub.com', '+91 9123450008', 1, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(9, NULL, 'CS2026009', 'REG-CS-009', 'Pranav Mishra', 'pranav.cs@examhub.com', '+91 9123450009', 1, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(10, NULL, 'CS2026010', 'REG-CS-010', 'Riya Kapoor', 'riya.cs@examhub.com', '+91 9123450010', 1, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(11, NULL, 'CS2026011', 'REG-CS-011', 'Siddharth Jain', 'siddharth.cs@examhub.com', '+91 9123450011', 1, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(12, NULL, 'CS2026012', 'REG-CS-012', 'Tanvi Mehta', 'tanvi.cs@examhub.com', '+91 9123450012', 1, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ECE Students (IDs 13-24)
INSERT INTO students (id, user_id, roll_number, registration_number, name, email, phone, department_id, section, semester, academic_year, active, created_at, updated_at) VALUES
(13, 102, 'EC2026001', 'REG-EC-001', 'Diya Patel', 'diya.ec@examhub.com', '+91 9123450013', 2, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(14, NULL, 'EC2026002', 'REG-EC-002', 'Aryan Pillai', 'aryan.ec@examhub.com', '+91 9123450014', 2, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(15, NULL, 'EC2026003', 'REG-EC-003', 'Bhavna Roy', 'bhavna.ec@examhub.com', '+91 9123450015', 2, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(16, NULL, 'EC2026004', 'REG-EC-004', 'Chetan Saxena', 'chetan.ec@examhub.com', '+91 9123450016', 2, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(17, NULL, 'EC2026005', 'REG-EC-005', 'Deepika Das', 'deepika.ec@examhub.com', '+91 9123450017', 2, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(18, NULL, 'EC2026006', 'REG-EC-006', 'Gaurav Kulkarni', 'gaurav.ec@examhub.com', '+91 9123450018', 2, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(19, NULL, 'EC2026007', 'REG-EC-007', 'Harini Iyer', 'harini.ec@examhub.com', '+91 9123450019', 2, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(20, NULL, 'EC2026008', 'REG-EC-008', 'Jaspreet Singh', 'jaspreet.ec@examhub.com', '+91 9123450020', 2, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(21, NULL, 'EC2026009', 'REG-EC-009', 'Kiran Bhat', 'kiran.ec@examhub.com', '+91 9123450021', 2, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(22, NULL, 'EC2026010', 'REG-EC-010', 'Meera Nambiar', 'meera.ec@examhub.com', '+91 9123450022', 2, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(23, NULL, 'EC2026011', 'REG-EC-011', 'Nikhil Chopra', 'nikhil.ec@examhub.com', '+91 9123450023', 2, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(24, NULL, 'EC2026012', 'REG-EC-012', 'Pallavi Ghosh', 'pallavi.ec@examhub.com', '+91 9123450024', 2, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- EEE Students (IDs 25-36)
INSERT INTO students (id, user_id, roll_number, registration_number, name, email, phone, department_id, section, semester, academic_year, active, created_at, updated_at) VALUES
(25, 103, 'EE2026001', 'REG-EE-001', 'Rohan Verma', 'rohan.ee@examhub.com', '+91 9123450025', 3, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(26, NULL, 'EE2026002', 'REG-EE-002', 'Pooja Tiwari', 'pooja.ee@examhub.com', '+91 9123450026', 3, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(27, NULL, 'EE2026003', 'REG-EE-003', 'Raghav Bansal', 'raghav.ee@examhub.com', '+91 9123450027', 3, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(28, NULL, 'EE2026004', 'REG-EE-004', 'Sanya Narang', 'sanya.ee@examhub.com', '+91 9123450028', 3, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(29, NULL, 'EE2026005', 'REG-EE-005', 'Tarun Shetty', 'tarun.ee@examhub.com', '+91 9123450029', 3, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(30, NULL, 'EE2026006', 'REG-EE-006', 'Uma Swaminathan', 'uma.ee@examhub.com', '+91 9123450030', 3, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(31, NULL, 'EE2026007', 'REG-EE-007', 'Varun Menon', 'varun.ee@examhub.com', '+91 9123450031', 3, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(32, NULL, 'EE2026008', 'REG-EE-008', 'Yamini Chawla', 'yamini.ee@examhub.com', '+91 9123450032', 3, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(33, NULL, 'EE2026009', 'REG-EE-009', 'Zoya Khan', 'zoya.ee@examhub.com', '+91 9123450033', 3, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(34, NULL, 'EE2026010', 'REG-EE-010', 'Abhishek Pandey', 'abhishek.ee@examhub.com', '+91 9123450034', 3, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(35, NULL, 'EE2026011', 'REG-EE-011', 'Bhavika Somani', 'bhavika.ee@examhub.com', '+91 9123450035', 3, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(36, NULL, 'EE2026012', 'REG-EE-012', 'Chirag Sethi', 'chirag.ee@examhub.com', '+91 9123450036', 3, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- MECH Students (IDs 37-48)
INSERT INTO students (id, user_id, roll_number, registration_number, name, email, phone, department_id, section, semester, academic_year, active, created_at, updated_at) VALUES
(37, NULL, 'ME2026001', 'REG-ME-001', 'Darshan Gowda', 'darshan.me@examhub.com', '+91 9123450037', 4, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(38, NULL, 'ME2026002', 'REG-ME-002', 'Esha Malviya', 'esha.me@examhub.com', '+91 9123450038', 4, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(39, NULL, 'ME2026003', 'REG-ME-003', 'Faizan Ali', 'faizan.me@examhub.com', '+91 9123450039', 4, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(40, NULL, 'ME2026004', 'REG-ME-004', 'Geetika Anand', 'geetika.me@examhub.com', '+91 9123450040', 4, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(41, NULL, 'ME2026005', 'REG-ME-005', 'Hardik Pandya', 'hardik.me@examhub.com', '+91 9123450041', 4, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(42, NULL, 'ME2026006', 'REG-ME-006', 'Indira Varma', 'indira.me@examhub.com', '+91 9123450042', 4, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(43, NULL, 'ME2026007', 'REG-ME-007', 'Jayesh Rathore', 'jayesh.me@examhub.com', '+91 9123450043', 4, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(44, NULL, 'ME2026008', 'REG-ME-008', 'Kritika Sen', 'kritika.me@examhub.com', '+91 9123450044', 4, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(45, NULL, 'ME2026009', 'REG-ME-009', 'Lokesh Yadav', 'lokesh.me@examhub.com', '+91 9123450045', 4, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(46, NULL, 'ME2026010', 'REG-ME-010', 'Madhuri Dixit', 'madhuri.me@examhub.com', '+91 9123450046', 4, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(47, NULL, 'ME2026011', 'REG-ME-011', 'Naveen Jindal', 'naveen.me@examhub.com', '+91 9123450047', 4, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(48, NULL, 'ME2026012', 'REG-ME-012', 'Ojaswini Roy', 'ojaswini.me@examhub.com', '+91 9123450048', 4, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- CIVIL Students (IDs 49-60)
INSERT INTO students (id, user_id, roll_number, registration_number, name, email, phone, department_id, section, semester, academic_year, active, created_at, updated_at) VALUES
(49, NULL, 'CE2026001', 'REG-CE-001', 'Prakash Jha', 'prakash.ce@examhub.com', '+91 9123450049', 5, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(50, NULL, 'CE2026002', 'REG-CE-002', 'Quasar Siddiqui', 'quasar.ce@examhub.com', '+91 9123450050', 5, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(51, NULL, 'CE2026003', 'REG-CE-003', 'Ritika Bhatt', 'ritika.ce@examhub.com', '+91 9123450051', 5, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(52, NULL, 'CE2026004', 'REG-CE-004', 'Saurabh Shukla', 'saurabh.ce@examhub.com', '+91 9123450052', 5, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(53, NULL, 'CE2026005', 'REG-CE-005', 'Trisha Paul', 'trisha.ce@examhub.com', '+91 9123450053', 5, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(54, NULL, 'CE2026006', 'REG-CE-006', 'Utkarsh Bajpai', 'utkarsh.ce@examhub.com', '+91 9123450054', 5, 'A', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(55, NULL, 'CE2026007', 'REG-CE-007', 'Vidya Balan', 'vidya.ce@examhub.com', '+91 9123450055', 5, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(56, NULL, 'CE2026008', 'REG-CE-008', 'Wahid Sheikh', 'wahid.ce@examhub.com', '+91 9123450056', 5, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(57, NULL, 'CE2026009', 'REG-CE-009', 'Xenia Dsouza', 'xenia.ce@examhub.com', '+91 9123450057', 5, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(58, NULL, 'CE2026010', 'REG-CE-010', 'Yuvraj Jadeja', 'yuvraj.ce@examhub.com', '+91 9123450058', 5, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(59, NULL, 'CE2026011', 'REG-CE-011', 'Zahid Hussain', 'zahid.ce@examhub.com', '+91 9123450059', 5, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(60, NULL, 'CE2026012', 'REG-CE-012', 'Anurag Kashyap', 'anurag.ce@examhub.com', '+91 9123450060', 5, 'B', 3, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 5. EXAM HALLS (3 Halls, 40 seats each = 120 total capacity)
INSERT INTO exam_halls (id, building, floor, room_number, hall_name, capacity, total_rows, total_columns, active, created_at, updated_at) VALUES
(1, 'Main Block', 1, '101', 'Hall 101 - Turing Hall', 40, 5, 8, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Main Block', 1, '102', 'Hall 102 - Lovelace Hall', 40, 5, 8, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Science Block', 2, '204', 'Hall 204 - Ramanujan Hall', 40, 5, 8, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 6. SEATS GENERATION FOR HALL 1 (5 rows x 8 columns = 40 seats: A1-E8)
INSERT INTO seats (hall_id, row_number, column_number, seat_number, active) VALUES
(1, 1, 1, 'A1', TRUE), (1, 1, 2, 'A2', TRUE), (1, 1, 3, 'A3', TRUE), (1, 1, 4, 'A4', TRUE), (1, 1, 5, 'A5', TRUE), (1, 1, 6, 'A6', TRUE), (1, 1, 7, 'A7', TRUE), (1, 1, 8, 'A8', TRUE),
(1, 2, 1, 'B1', TRUE), (1, 2, 2, 'B2', TRUE), (1, 2, 3, 'B3', TRUE), (1, 2, 4, 'B4', TRUE), (1, 2, 5, 'B5', TRUE), (1, 2, 6, 'B6', TRUE), (1, 2, 7, 'B7', TRUE), (1, 2, 8, 'B8', TRUE),
(1, 3, 1, 'C1', TRUE), (1, 3, 2, 'C2', TRUE), (1, 3, 3, 'C3', TRUE), (1, 3, 4, 'C4', TRUE), (1, 3, 5, 'C5', TRUE), (1, 3, 6, 'C6', TRUE), (1, 3, 7, 'C7', TRUE), (1, 3, 8, 'C8', TRUE),
(1, 4, 1, 'D1', TRUE), (1, 4, 2, 'D2', TRUE), (1, 4, 3, 'D3', TRUE), (1, 4, 4, 'D4', TRUE), (1, 4, 5, 'D5', TRUE), (1, 4, 6, 'D6', TRUE), (1, 4, 7, 'D7', TRUE), (1, 4, 8, 'D8', TRUE),
(1, 5, 1, 'E1', TRUE), (1, 5, 2, 'E2', TRUE), (1, 5, 3, 'E3', TRUE), (1, 5, 4, 'E4', TRUE), (1, 5, 5, 'E5', TRUE), (1, 5, 6, 'E6', TRUE), (1, 5, 7, 'E7', TRUE), (1, 5, 8, 'E8', TRUE);

-- SEATS FOR HALL 2 (40 seats: A1-E8)
INSERT INTO seats (hall_id, row_number, column_number, seat_number, active) VALUES
(2, 1, 1, 'A1', TRUE), (2, 1, 2, 'A2', TRUE), (2, 1, 3, 'A3', TRUE), (2, 1, 4, 'A4', TRUE), (2, 1, 5, 'A5', TRUE), (2, 1, 6, 'A6', TRUE), (2, 1, 7, 'A7', TRUE), (2, 1, 8, 'A8', TRUE),
(2, 2, 1, 'B1', TRUE), (2, 2, 2, 'B2', TRUE), (2, 2, 3, 'B3', TRUE), (2, 2, 4, 'B4', TRUE), (2, 2, 5, 'B5', TRUE), (2, 2, 6, 'B6', TRUE), (2, 2, 7, 'B7', TRUE), (2, 2, 8, 'B8', TRUE),
(2, 3, 1, 'C1', TRUE), (2, 3, 2, 'C2', TRUE), (2, 3, 3, 'C3', TRUE), (2, 3, 4, 'C4', TRUE), (2, 3, 5, 'C5', TRUE), (2, 3, 6, 'C6', TRUE), (2, 3, 7, 'C7', TRUE), (2, 3, 8, 'C8', TRUE),
(2, 4, 1, 'D1', TRUE), (2, 4, 2, 'D2', TRUE), (2, 4, 3, 'D3', TRUE), (2, 4, 4, 'D4', TRUE), (2, 4, 5, 'D5', TRUE), (2, 4, 6, 'D6', TRUE), (2, 4, 7, 'D7', TRUE), (2, 4, 8, 'D8', TRUE),
(2, 5, 1, 'E1', TRUE), (2, 5, 2, 'E2', TRUE), (2, 5, 3, 'E3', TRUE), (2, 5, 4, 'E4', TRUE), (2, 5, 5, 'E5', TRUE), (2, 5, 6, 'E6', TRUE), (2, 5, 7, 'E7', TRUE), (2, 5, 8, 'E8', TRUE);

-- SEATS FOR HALL 3 (40 seats: A1-E8)
INSERT INTO seats (hall_id, row_number, column_number, seat_number, active) VALUES
(3, 1, 1, 'A1', TRUE), (3, 1, 2, 'A2', TRUE), (3, 1, 3, 'A3', TRUE), (3, 1, 4, 'A4', TRUE), (3, 1, 5, 'A5', TRUE), (3, 1, 6, 'A6', TRUE), (3, 1, 7, 'A7', TRUE), (3, 1, 8, 'A8', TRUE),
(3, 2, 1, 'B1', TRUE), (3, 2, 2, 'B2', TRUE), (3, 2, 3, 'B3', TRUE), (3, 2, 4, 'B4', TRUE), (3, 2, 5, 'B5', TRUE), (3, 2, 6, 'B6', TRUE), (3, 2, 7, 'B7', TRUE), (3, 2, 8, 'B8', TRUE),
(3, 3, 1, 'C1', TRUE), (3, 3, 2, 'C2', TRUE), (3, 3, 3, 'C3', TRUE), (3, 3, 4, 'C4', TRUE), (3, 3, 5, 'C5', TRUE), (3, 3, 6, 'C6', TRUE), (3, 3, 7, 'C7', TRUE), (3, 3, 8, 'C8', TRUE),
(3, 4, 1, 'D1', TRUE), (3, 4, 2, 'D2', TRUE), (3, 4, 3, 'D3', TRUE), (3, 4, 4, 'D4', TRUE), (3, 4, 5, 'D5', TRUE), (3, 4, 6, 'D6', TRUE), (3, 4, 7, 'D7', TRUE), (3, 4, 8, 'D8', TRUE),
(3, 5, 1, 'E1', TRUE), (3, 5, 2, 'E2', TRUE), (3, 5, 3, 'E3', TRUE), (3, 5, 4, 'E4', TRUE), (3, 5, 5, 'E5', TRUE), (3, 5, 6, 'E6', TRUE), (3, 5, 7, 'E7', TRUE), (3, 5, 8, 'E8', TRUE);

-- 7. EXAMINATIONS
INSERT INTO exams (id, subject_id, exam_date, start_time, end_time, duration_minutes, semester, academic_year, exam_type, status, created_at, updated_at) VALUES
(1, 1, '2026-11-20', '10:00:00', '13:00:00', 180, 3, '2026-2027', 'END_SEMESTER', 'SCHEDULED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 3, '2026-11-22', '10:00:00', '13:00:00', 180, 3, '2026-2027', 'END_SEMESTER', 'DRAFT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 4, '2026-11-24', '14:00:00', '17:00:00', 180, 3, '2026-2027', 'END_SEMESTER', 'DRAFT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 8. EXAM REGISTRATIONS FOR EXAM 1 (All 60 students registered for Data Structures)
INSERT INTO exam_registrations (exam_id, student_id, registration_status, registered_at)
SELECT 1, id, 'REGISTERED', CURRENT_TIMESTAMP FROM students;

-- Reset sequences for seeded tables in PostgreSQL
SELECT setval(COALESCE(pg_get_serial_sequence('users', 'id'), 'users_id_seq'), 200);
SELECT setval(COALESCE(pg_get_serial_sequence('departments', 'id'), 'departments_id_seq'), 10);
SELECT setval(COALESCE(pg_get_serial_sequence('subjects', 'id'), 'subjects_id_seq'), 10);
SELECT setval(COALESCE(pg_get_serial_sequence('students', 'id'), 'students_id_seq'), 100);
SELECT setval(COALESCE(pg_get_serial_sequence('exam_halls', 'id'), 'exam_halls_id_seq'), 10);
SELECT setval(COALESCE(pg_get_serial_sequence('seats', 'id'), 'seats_id_seq'), 200);
SELECT setval(COALESCE(pg_get_serial_sequence('exams', 'id'), 'exams_id_seq'), 10);
SELECT setval(COALESCE(pg_get_serial_sequence('exam_registrations', 'id'), 'exam_registrations_id_seq'), 100);

