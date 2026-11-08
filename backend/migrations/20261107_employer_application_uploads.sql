ALTER TABLE internships
  ADD COLUMN IF NOT EXISTS application_form_url VARCHAR(500);

CREATE TABLE IF NOT EXISTS internship_applications (
  id SERIAL PRIMARY KEY,
  internship_id INTEGER REFERENCES internships(id) ON DELETE CASCADE NOT NULL,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(25) NOT NULL,
  cover_letter TEXT NOT NULL,
  cv_storage_key VARCHAR(100) NOT NULL,
  cv_original_name VARCHAR(255) NOT NULL,
  status VARCHAR(30) DEFAULT 'SUBMITTED' NOT NULL,
  submitted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(internship_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_internship_applications_student
  ON internship_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_internship_applications_internship
  ON internship_applications(internship_id);
