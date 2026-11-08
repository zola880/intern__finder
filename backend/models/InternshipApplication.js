const pool = require('../config/db');

const InternshipApplication = {
  async create({ internshipId, studentId, fullName, email, phone, coverLetter, cvStorageKey, cvOriginalName }) {
    const result = await pool.query(`
      INSERT INTO internship_applications
        (internship_id, student_id, full_name, email, phone, cover_letter, cv_storage_key, cv_original_name)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id, internship_id, student_id, full_name, email, phone, cover_letter, status, submitted_at
    `, [internshipId, studentId, fullName, email, phone, coverLetter, cvStorageKey, cvOriginalName]);
    return result.rows[0];
  },

  async findByStudent(studentId) {
    const result = await pool.query(`
      SELECT a.id, a.internship_id, a.full_name, a.email, a.phone, a.cover_letter,
        a.status, a.submitted_at, i.company_name, i.field, i.location, i.company_logo_url
      FROM internship_applications a
      JOIN internships i ON i.id = a.internship_id
      WHERE a.student_id = $1
      ORDER BY a.submitted_at DESC
    `, [studentId]);
    return result.rows;
  },

  async findReceivedByEmployer(employerId, isAdmin = false) {
    const result = await pool.query(`
      SELECT a.id, a.internship_id, a.student_id, a.full_name, a.email, a.phone,
        a.cover_letter, a.cv_original_name, a.status, a.submitted_at,
        i.company_name, i.field, i.short_description, i.submitted_by
      FROM internship_applications a
      JOIN internships i ON i.id = a.internship_id
      ${isAdmin ? '' : 'WHERE i.submitted_by = $1'}
      ORDER BY a.submitted_at DESC
    `, isAdmin ? [] : [employerId]);
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(`
      SELECT a.id, a.student_id, a.cv_storage_key, i.submitted_by
      FROM internship_applications a
      JOIN internships i ON i.id = a.internship_id
      WHERE a.id = $1
    `, [id]);
    return result.rows[0] || null;
  },
};

module.exports = InternshipApplication;
