CREATE DATABASE IF NOT EXISTS student_records_local;

USE student_records_local;

-- Replace the example host pattern with the development computer's LAN IP.
-- Prefer one fixed client address instead of a whole subnet wildcard.
-- CREATE USER 'student_app'@'192.168.1.25' IDENTIFIED BY 'UseAUniqueStrongPassword';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON student_records_local.* TO 'student_app'@'192.168.1.25';

CREATE TABLE IF NOT EXISTS students (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_number VARCHAR(30) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    course VARCHAR(100) NOT NULL,
    year_level TINYINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO students (student_number, first_name, last_name, course, year_level)
VALUES
    ('2026-0001', 'Ana', 'Santos', 'BSIT', 1),
    ('2026-0002', 'Mark', 'Reyes', 'BSIT', 2)
ON DUPLICATE KEY UPDATE
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    course = VALUES(course),
    year_level = VALUES(year_level);
