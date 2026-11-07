const pool = require('../config/db');

const AdminApplication = {
  async findOne({ applicantId, status }) {
    const result = await pool.query(`
      SELECT * FROM admin_applications WHERE applicant_id = $1 AND status = $2
    `, [applicantId, status]);
    return result.rows[0] || null;
  },

  async create({ applicantId, universityName, reason }) {
    const result = await pool.query(`
      INSERT INTO admin_applications (applicant_id, university_name, reason)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [applicantId, universityName, reason]);
    return this.toCamelCase(result.rows[0]);
  },

  async find({ status } = {}) {
    let sql = `
      SELECT a.*, u.full_name AS applicant_full_name, u.email AS applicant_email
      FROM admin_applications a
      JOIN users u ON a.applicant_id = u.id
    `;
    const values = [];
    let i = 1;

    if (status) {
      sql += ` WHERE a.status = $${i++}`;
      values.push(status);
    }

    sql += ` ORDER BY a.created_at DESC`;

    const result = await pool.query(sql, values);
    return result.rows.map(row => this.toCamelCase(row));
  },

  async findById(id) {
    const result = await pool.query(`
      SELECT a.*, u.full_name AS applicant_full_name, u.email AS applicant_email
      FROM admin_applications a
      JOIN users u ON a.applicant_id = u.id
      WHERE a.id = $1
    `, [id]);
    return result.rows[0] ? this.toCamelCase(result.rows[0]) : null;
  },

  async updateById(id, updates) {
    const setParts = [];
    const values = [];
    let i = 1;

    const colMap = {
      status: 'status', adminNotes: 'admin_notes', reviewedBy: 'reviewed_by_id',
      reviewedAt: 'reviewed_at'
    };

    Object.keys(updates).forEach(key => {
      const col = colMap[key];
      if (col && updates[key] !== undefined) {
        setParts.push(`${col} = $${i++}`);
        values.push(updates[key]);
      }
    });

    if (setParts.length === 0) return this.findById(id);

    setParts.push('updated_at = NOW()');
    values.push(id);

    const result = await pool.query(`
      UPDATE admin_applications SET ${setParts.join(', ')} WHERE id = $${i}
      RETURNING *
    `, values);
    return result.rows[0] ? this.toCamelCase(result.rows[0]) : null;
  },

  toCamelCase(row) {
    if (!row) return null;
    return {
      id: row.id,
      _id: row.id,
      applicant: {
        id: row.applicant_id,
        _id: row.applicant_id,
        fullName: row.applicant_full_name,
        email: row.applicant_email,
      },
      applicantId: row.applicant_id,
      universityName: row.university_name,
      reason: row.reason,
      status: row.status,
      reviewedBy: row.reviewed_by_id,
      reviewedAt: row.reviewed_at,
      adminNotes: row.admin_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },
};

module.exports = AdminApplication;
