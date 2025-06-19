-- Create database
CREATE DATABASE IF NOT EXISTS lms_db;
USE lms_db;
-- Disable foreign key checks temporarily to allow table creation in any order (though ordered here)
-- and for easier dropping/recreating during development if needed.
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Create `departments` table (no external foreign keys)
CREATE TABLE IF NOT EXISTS `departments` (
    `department_name` VARCHAR(255) NOT NULL PRIMARY KEY
);

-- 2. Create `sections` table (depends on `departments`)
CREATE TABLE IF NOT EXISTS `sections` (
    `section_name` VARCHAR(255) NOT NULL PRIMARY KEY,
    `department` VARCHAR(255),
    `semester` VARCHAR(255) NOT NULL ,
    CONSTRAINT `fk_sections_department` FOREIGN KEY (`department`) REFERENCES `departments`(`department_name`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 3. Create `courses` table (no external foreign keys)
CREATE TABLE IF NOT EXISTS `courses` (
    `course_id` VARCHAR(20) NOT NULL PRIMARY KEY,
    `course_name` VARCHAR(100) NOT NULL,
    `course_description` VARCHAR(255) NOT NULL,
    `course_credit_hours` INT NOT NULL
);

-- 4. Create `instructors` table (depends on `departments`)
CREATE TABLE IF NOT EXISTS `instructors` (
    `instructor_id` VARCHAR(20) NOT NULL PRIMARY KEY,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `phone_number` VARCHAR(100) NOT NULL UNIQUE,
    `cnic` VARCHAR(25) NOT NULL UNIQUE,
    `department` VARCHAR(255), -- Changed to 255 to match department_name
    `qualification` VARCHAR(255) NULL,
    `specialization` VARCHAR(255) NULL,
    `year_of_experience` INT NULL,
    `picture` VARCHAR(255) NULL,
    CONSTRAINT `fk_instructors_department` FOREIGN KEY (`department`) REFERENCES `departments`(`department_name`) ON DELETE SET NULL ON UPDATE CASCADE
);

-- 5. Create `students` table (depends on `departments` and `sections`)
CREATE TABLE IF NOT EXISTS `students` (
    `student_id` VARCHAR(20) NOT NULL PRIMARY KEY,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `phone_number` VARCHAR(100) NOT NULL UNIQUE,
    `cnic` VARCHAR(25) NOT NULL UNIQUE,
    `program` VARCHAR(255), -- Changed to 255 to match department_name
    `section` VARCHAR(255), -- Changed to 255 to match section_name
    `enrollment_year` INT NOT NULL,
    `picture` VARCHAR(255) NULL,
    CONSTRAINT `fk_students_program` FOREIGN KEY (`program`) REFERENCES `departments`(`department_name`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_students_section` FOREIGN KEY (`section`) REFERENCES `sections`(`section_name`) ON DELETE SET NULL ON UPDATE CASCADE
);


-- 6. Create the `course_prerequisites` table
-- This table defines which courses are prerequisites for other courses.
CREATE TABLE IF NOT EXISTS `course_prerequisites` (
    `prerequisite_id` INT AUTO_INCREMENT PRIMARY KEY,
    `course_id` VARCHAR(20) NOT NULL, -- The main course that has prerequisites
    `prereq_course_id` VARCHAR(20) NOT NULL, -- The course that is a prerequisite for 'course_id'
    
    CONSTRAINT `fk_prereq_course` FOREIGN KEY (`course_id`) REFERENCES `courses`(`course_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_prereq_prereq_course` FOREIGN KEY (`prereq_course_id`) REFERENCES `courses`(`course_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Ensures a course only has a specific prerequisite listed once
    UNIQUE (`course_id`, `prereq_course_id`) 
);


-- 7. Create `course_offerings` table (depends on `courses`, `sections`, `instructors`)
CREATE TABLE `course_offerings` (
    `offering_id` INT AUTO_INCREMENT PRIMARY KEY,
    `course_id` VARCHAR(20) NOT NULL,
    `section_name` VARCHAR(255) NOT NULL,
    `instructor_id` VARCHAR(20) NOT NULL,
    `capacity` INT NOT NULL DEFAULT 50, -- NEW COLUMN: To store the maximum number of students allowed for this offering
    `schedule_time` VARCHAR(255) NULL,
    CONSTRAINT `fk_offering_course` FOREIGN KEY (`course_id`) REFERENCES `courses`(`course_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_offering_section` FOREIGN KEY (`section_name`) REFERENCES `sections`(`section_name`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_offering_instructor` FOREIGN KEY (`instructor_id`) REFERENCES `instructors`(`instructor_id`) ON DELETE RESTRICT ON UPDATE CASCADE,

    UNIQUE (`course_id`, `section_name`)
);

-- 8. Create `student_course_enrollments` table (depends on `students`, `course_offerings`)
CREATE TABLE `student_course_enrollments` (
    `enrollment_id` INT AUTO_INCREMENT PRIMARY KEY,
    `student_id` VARCHAR(20) NOT NULL,
    `offering_id` INT NOT NULL,
    `enrollment_date` DATE NOT NULL DEFAULT (CURRENT_DATE),
    `grade` VARCHAR(5) NULL,

    CONSTRAINT `fk_student_enroll_student` FOREIGN KEY (`student_id`) REFERENCES `students`(`student_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `fk_student_enroll_offering` FOREIGN KEY (`offering_id`) REFERENCES `course_offerings`(`offering_id`) ON DELETE RESTRICT ON UPDATE CASCADE,

    UNIQUE (`student_id`, `offering_id`) -- Ensures a student enrolls in a specific offering only once
);
-- INSTUCTORS TABLES    

CREATE TABLE IF NOT EXISTS attendance_records (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    offering_id INT NOT NULL,
    student_id VARCHAR(20) NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('Present', 'Absent', 'Leave') NOT NULL,

    CONSTRAINT fk_attend_offering FOREIGN KEY (offering_id)
        REFERENCES course_offerings(offering_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_attend_student FOREIGN KEY (student_id)
        REFERENCES students(student_id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    UNIQUE (offering_id, student_id, attendance_date) -- Prevents duplicate entries
);

CREATE TABLE IF NOT EXISTS course_materials (
    material_id INT AUTO_INCREMENT PRIMARY KEY,
    offering_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_material_offering FOREIGN KEY (offering_id)
        REFERENCES course_offerings(offering_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);





CREATE TABLE IF NOT EXISTS exam_records ( 
exam_id INT AUTO_INCREMENT PRIMARY KEY, 
offering_id INT NOT NULL, 
student_id VARCHAR(20) NOT NULL, 
exam_type ENUM('Quiz', 'Midterm', 'Final', 'Assignment') NOT NULL, 
total_marks INT NOT NULL, 
obtained_marks INT NOT NULL, 
exam_date DATE NOT NULL, 
CONSTRAINT fk_exam_offering FOREIGN KEY (offering_id) 
REFERENCES course_offerings(offering_id) 
ON DELETE CASCADE ON UPDATE CASCADE, 
CONSTRAINT fk_exam_student FOREIGN KEY (student_id) 
REFERENCES students(student_id) 
ON DELETE CASCADE ON UPDATE CASCADE 
);

-- Admin Roles Tables
CREATE TABLE IF NOT EXISTS admin_users (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS admin_permissions (
    permission_id INT AUTO_INCREMENT PRIMARY KEY,
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS admin_role_permissions (
    role_id INT,
    permission_id INT,
    FOREIGN KEY (role_id) REFERENCES admin_roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES admin_permissions(permission_id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS admin_user_roles (
    admin_id INT,
    role_id INT,
    FOREIGN KEY (admin_id) REFERENCES admin_users(admin_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES admin_roles(role_id) ON DELETE CASCADE,
    PRIMARY KEY (admin_id, role_id)
);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;