CREATE TABLE Students (
  student_id        VARCHAR(10) PRIMARY KEY,
  full_name         VARCHAR(80) NOT NULL,
  level             VARCHAR(10) NOT NULL,
  branch            VARCHAR(5)  NOT NULL,
  date_of_birth     VARCHAR(20) NOT NULL,
  section_number    VARCHAR(20) NOT NULL,
  email             VARCHAR(80),
  telephone_number  VARCHAR(50),
  fingerprint       BYTEA,
  password          VARCHAR(255) NOT NULL
);

CREATE TABLE Professors (
  professor_id      VARCHAR(10) PRIMARY KEY,
  full_name         VARCHAR(80) NOT NULL,
  design            VARCHAR(20) NOT NULL, -- Head or just prof
  department        VARCHAR(50) NOT NULL,
  address           VARCHAR(50),
  office_location   VARCHAR(10),
  email             VARCHAR(80),
  telephone_number  VARCHAR(50),
  password          VARCHAR(255) NOT NULL
);

CREATE TABLE fingerprints (
  student_id    VARCHAR(10) PRIMARY KEY,
  student_name  VARCHAR(80),
  fingerprint   BYTEA
);

CREATE TABLE IF NOT EXISTS Attendance (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(10) NOT NULL,
  section_number VARCHAR(20) NOT NULL,
  session_label VARCHAR(10) NOT NULL,
  course_name VARCHAR(100),
  attendance INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES Students(student_id),
  UNIQUE(student_id, section_number, session_label, course_name)
);