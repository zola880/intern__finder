const pool = require('../config/db');

const SavedInternship = {
  async find({ userId } = {}) {
    const result = await pool.query(`
      SELECT i.*, u.full_name AS submitted_by_name, u.email AS submitted_by_email
      FROM saved_internships s
      JOIN internships i ON s.internship_id = i.id
      LEFT JOIN users u ON i.submitted_by = u.id
      WHERE s.user_id = $1
      ORDER BY s.created_at DESC
    `, [userId]);
    return result.rows.map(row => this.toCamelCase(row));
  },

  async findOne({ userId, internshipId }) {
    const result = await pool.query(`
      SELECT * FROM saved_internships WHERE user_id = $1 AND internship_id = $2
    `, [userId, internshipId]);
    return result.rows[0] || null;
  },

  async create({ userId, internshipId }) {
    const result = await pool.query(`
      INSERT INTO saved_internships (user_id, internship_id)
      VALUES ($1, $2)
      RETURNING *
    `, [userId, internshipId]);
    return result.rows[0];
  },

  async findOneAndDelete({ userId, internshipId }) {
    const result = await pool.query(`
      DELETE FROM saved_internships WHERE user_id = $1 AND internship_id = $2 RETURNING *
    `, [userId, internshipId]);
    return result.rows[0] || null;
  },

  toCamelCase(row) {
    if (!row) return null;
    return {
      id: row.id,
      _id: row.id,
      companyName: row.company_name,
      companyLogoUrl: row.company_logo_url,
      location: row.location,
      field: row.field,
      status: row.status,
      approvalStatus: row.approval_status,
      shortDescription: row.short_description,
      fullDescription: row.full_description,
      requiredSkills: row.required_skills || [],
      duration: row.duration,
      deadline: row.deadline,
      website: row.website,
      submittedBy: row.submitted_by,
      adminNotes: row.admin_notes,
      approvedAt: row.approved_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },
};

module.exports = SavedInternship;
