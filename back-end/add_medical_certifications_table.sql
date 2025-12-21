-- Add Medical Certifications table
CREATE TABLE IF NOT EXISTS MedicalCertifications (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(10) NOT NULL,
    course_name VARCHAR(100) NOT NULL,
    session_label VARCHAR(10) NOT NULL,
    certification_file BYTEA NOT NULL,
    file_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    -- pending, approved, rejected
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by VARCHAR(10),
    -- professor_id
    professor_notes VARCHAR(500),
    FOREIGN KEY (student_id) REFERENCES Students(student_id),
    FOREIGN KEY (reviewed_by) REFERENCES Professors(professor_id),
    UNIQUE(student_id, course_name, session_label)
);
-- Index for faster queries
CREATE INDEX idx_medical_certifications_student ON MedicalCertifications(student_id);
CREATE INDEX idx_medical_certifications_status ON MedicalCertifications(status);
CREATE INDEX idx_medical_certifications_course ON MedicalCertifications(course_name, session_label);