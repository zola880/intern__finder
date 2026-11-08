-- Run this in your PostgreSQL database to create all tables
-- Example: psql -U postgres -d internfinder -f schema.sql

DROP TABLE IF EXISTS announcement_status_history CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS saved_internships CASCADE;
DROP TABLE IF EXISTS admin_applications CASCADE;
DROP TABLE IF EXISTS internships CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'STUDENT' CHECK (role IN ('STUDENT','EMPLOYER','UNIVERSITY_ADMIN','ADMIN')),
  full_name VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  university VARCHAR(255),
  year VARCHAR(10),
  experience_level VARCHAR(50) DEFAULT 'Beginner' CHECK (experience_level IN ('Beginner','Intermediate','Advanced')),
  goal TEXT,
  interests TEXT[] DEFAULT '{}',
  location VARCHAR(255),
  bank_account VARCHAR(255),
  refresh_token VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE internships (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  company_logo_url VARCHAR(500),
  location VARCHAR(255),
  field VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'Open' CHECK (status IN ('Open','Closed')),
  approval_status VARCHAR(50) DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING','APPROVED','REJECTED')),
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  required_skills TEXT[] DEFAULT '{}',
  duration VARCHAR(100),
  deadline TIMESTAMP,
  website VARCHAR(500),
  application_form_url VARCHAR(500),
  submitted_by INTEGER REFERENCES users(id) NOT NULL,
  admin_notes TEXT,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE saved_internships (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  internship_id INTEGER REFERENCES internships(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, internship_id)
);

CREATE TABLE admin_applications (
  id SERIAL PRIMARY KEY,
  applicant_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  university_name VARCHAR(255) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
  reviewed_by_id INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP,
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  internship_id INTEGER REFERENCES internships(id) ON DELETE CASCADE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  year VARCHAR(50) NOT NULL,
  ai_verdict VARCHAR(50),
  ai_confidence INTEGER,
  ai_notes TEXT,
  bank_account_encrypted VARCHAR(500) NOT NULL,
  acceptance_letter_url VARCHAR(500) NOT NULL,
  student_id_photo_url VARCHAR(500) DEFAULT '',
  status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING','VERIFIED','STIPEND_SENT','REJECTED')),
  processed_at TIMESTAMP,
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE internship_applications (
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

CREATE TABLE announcement_status_history (
  id SERIAL PRIMARY KEY,
  announcement_id INTEGER REFERENCES announcements(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(50) NOT NULL,
  changed_by_id INTEGER REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW(),
  note TEXT
);

CREATE INDEX idx_internships_field ON internships(field);
CREATE INDEX idx_internships_approval_status ON internships(approval_status);
CREATE INDEX idx_internships_submitted_by ON internships(submitted_by);
CREATE INDEX idx_saved_internships_user ON saved_internships(user_id);
CREATE INDEX idx_announcements_student ON announcements(student_id);
CREATE INDEX idx_announcements_internship ON announcements(internship_id);
CREATE INDEX idx_admin_applications_applicant ON admin_applications(applicant_id);
CREATE INDEX idx_internship_applications_student ON internship_applications(student_id);
CREATE INDEX idx_internship_applications_internship ON internship_applications(internship_id);
