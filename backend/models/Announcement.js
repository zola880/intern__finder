const pool = require('../config/db');

const Announcement = {
  async create(data) {
    const {
      studentId, internshipId, fullName, department, year,
      bankAccountEncrypted, acceptanceLetterUrl, studentIdPhotoUrl = '',
      status = 'PENDING', aiVerdict, aiConfidence, aiNotes
    } = data;

    const result = await pool.query(`
      INSERT INTO announcements
      (student_id, internship_id, full_name, department, year, bank_account_encrypted,
       acceptance_letter_url, student_id_photo_url, status, ai_verdict, ai_confidence, ai_notes)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
    `, [
      studentId, internshipId, fullName, department, year, bankAccountEncrypted,
      acceptanceLetterUrl, studentIdPhotoUrl, status, aiVerdict, aiConfidence, aiNotes
    ]);
    return this.toCamelCase(result.rows[0]);
  },

  async find({ studentId } = {}) {
    let sql = `
      SELECT a.*, i.company_name, i.field, i.location
      FROM announcements a
      JOIN internships i ON a.internship_id = i.id
    `;
    const values = [];
    let i = 1;

    if (studentId) {
      sql += ` WHERE a.student_id = $${i++}`;
      values.push(studentId);
    }

    sql += ` ORDER BY a.created_at DESC`;

    const result = await pool.query(sql, values);
    return result.rows.map(row => this.toCamelCase(row));
  },

  async findByUniversity({ university, role, adminId }) {
    let sql = `
      SELECT a.*, u.full_name AS student_full_name, u.email AS student_email,
             i.company_name, i.field, i.location
      FROM announcements a
      JOIN users u ON a.student_id = u.id
      JOIN internships i ON a.internship_id = i.id
    `;
    const values = [];
    let i = 1;

    if (role === 'UNIVERSITY_ADMIN') {
      sql += ` WHERE u.university = $${i++} AND u.role = 'STUDENT'`;
      values.push(university);
    }

    sql += ` ORDER BY a.created_at DESC`;

    const result = await pool.query(sql, values);
    return result.rows.map(row => this.toCamelCase(row));
  },

  async findById(id) {
    const result = await pool.query(`
      SELECT a.*, u.full_name AS student_full_name, u.email AS student_email,
             i.company_name, i.field, i.location
      FROM announcements a
      JOIN users u ON a.student_id = u.id
      JOIN internships i ON a.internship_id = i.id
      WHERE a.id = $1
    `, [id]);
    return result.rows[0] ? this.toCamelCase(result.rows[0]) : null;
  },

  async updateStatus(id, updates) {
    const setParts = [];
    const values = [];
    let i = 1;

    const colMap = {
      status: 'status', processedAt: 'processed_at', adminNotes: 'admin_notes'
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
      UPDATE announcements SET ${setParts.join(', ')} WHERE id = $${i}
      RETURNING *
    `, values);
    return result.rows[0] ? this.toCamelCase(result.rows[0]) : null;
  },

  async addStatusHistory({ announcementId, status, changedById, note }) {
    await pool.query(`
      INSERT INTO announcement_status_history (announcement_id, status, changed_by_id, note)
      VALUES ($1, $2, $3, $4)
    `, [announcementId, status, changedById, note]);
  },

  toCamelCase(row) {
    if (!row) return null;
    return {
      id: row.id,
      _id: row.id,
      student: {
        id: row.student_id,
        _id: row.student_id,
        fullName: row.student_full_name,
        email: row.student_email,
      },
      studentId: row.student_id,
      internship: {
        id: row.internship_id,
        companyName: row.company_name,
        field: row.field,
        location: row.location,
      },
      internshipId: row.internship_id,
      fullName: row.full_name,
      department: row.department,
      year: row.year,
      aiVerdict: row.ai_verdict,
      aiConfidence: row.ai_confidence,
      aiNotes: row.ai_notes,
      bankAccountEncrypted: row.bank_account_encrypted,
      acceptanceLetterUrl: row.acceptance_letter_url,
      studentIdPhotoUrl: row.student_id_photo_url,
      status: row.status,
      processedAt: row.processed_at,
      adminNotes: row.admin_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },
};

module.exports = Announcement;
