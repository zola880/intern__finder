const pool = require('../config/db');

const Internship = {
  // Find all internships with filters, pagination, sort
  async find({
    search, field, status, approvalStatus,
    page = 1, limit = 10, sort = 'newest',
    submittedBy, role
  } = {}) {
    let sql = `
      SELECT i.*, u.full_name AS submitted_by_name, u.email AS submitted_by_email
      FROM internships i
      LEFT JOIN users u ON i.submitted_by = u.id
      WHERE 1=1
    `;
    const values = [];
    let i = 1;

    // Role-based visibility
    if (role === 'STUDENT' || !role) {
      sql += ` AND i.approval_status = $${i++}`;
      values.push('APPROVED');
    } else if (role === 'EMPLOYER' && submittedBy) {
      sql += ` AND i.submitted_by = $${i++}`;
      values.push(submittedBy);
    } else if (role === 'ADMIN' && approvalStatus) {
      sql += ` AND i.approval_status = $${i++}`;
      values.push(approvalStatus);
    }

    if (approvalStatus && role !== 'ADMIN') {
      sql += ` AND i.approval_status = $${i++}`;
      values.push(approvalStatus);
    }

    if (search) {
      sql += ` AND (i.company_name ILIKE $${i++} OR i.short_description ILIKE $${i++})`;
      values.push(`%${search}%`, `%${search}%`);
    }
    if (field && field !== 'All') {
      sql += ` AND i.field = $${i++}`;
      values.push(field);
    }
    if (status) {
      sql += ` AND i.status = $${i++}`;
      values.push(status);
    }

    // Sort
    if (sort === 'deadline_asc') sql += ` ORDER BY i.deadline ASC NULLS LAST`;
    else if (sort === 'deadline_desc') sql += ` ORDER BY i.deadline DESC NULLS LAST`;
    else sql += ` ORDER BY i.created_at DESC`;

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ` LIMIT $${i++} OFFSET $${i++}`;
    values.push(parseInt(limit), offset);

    const result = await pool.query(sql, values);
    return result.rows.map(row => this.toCamelCase(row));
  },

  // Count total matching documents
  async countDocuments({
    search, field, status, approvalStatus,
    submittedBy, role
  } = {}) {
    let sql = 'SELECT COUNT(*) FROM internships WHERE 1=1';
    const values = [];
    let i = 1;

    if (role === 'STUDENT' || !role) {
      sql += ` AND approval_status = $${i++}`;
      values.push('APPROVED');
    } else if (role === 'EMPLOYER' && submittedBy) {
      sql += ` AND submitted_by = $${i++}`;
      values.push(submittedBy);
    } else if (role === 'ADMIN' && approvalStatus) {
      sql += ` AND approval_status = $${i++}`;
      values.push(approvalStatus);
    }

    if (approvalStatus && role !== 'ADMIN') {
      sql += ` AND approval_status = $${i++}`;
      values.push(approvalStatus);
    }

    if (search) {
      sql += ` AND (company_name ILIKE $${i++} OR short_description ILIKE $${i++})`;
      values.push(`%${search}%`, `%${search}%`);
    }
    if (field && field !== 'All') {
      sql += ` AND field = $${i++}`;
      values.push(field);
    }
    if (status) {
      sql += ` AND status = $${i++}`;
      values.push(status);
    }

    const result = await pool.query(sql, values);
    return parseInt(result.rows[0].count, 10);
  },

  // Find by id
  async findById(id) {
    const result = await pool.query(`
      SELECT i.*, u.full_name AS submitted_by_name, u.email AS submitted_by_email
      FROM internships i
      LEFT JOIN users u ON i.submitted_by = u.id
      WHERE i.id = $1
    `, [id]);
    return result.rows[0] ? this.toCamelCase(result.rows[0]) : null;
  },

  // Create
  async create(data) {
    const {
      companyName, companyLogoUrl, applicationFormUrl, location, field, status = 'Open',
      approvalStatus = 'PENDING', shortDescription, fullDescription,
      requiredSkills = [], duration, deadline, website, submittedBy,
      adminNotes
    } = data;

    const result = await pool.query(`
      INSERT INTO internships
      (company_name, company_logo_url, application_form_url, location, field, status, approval_status,
       short_description, full_description, required_skills, duration, deadline,
       website, submitted_by, admin_notes)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *
    `, [
      companyName, companyLogoUrl, applicationFormUrl, location, field, status, approvalStatus,
      shortDescription, fullDescription, requiredSkills, duration, deadline,
      website, submittedBy, adminNotes
    ]);
    return this.toCamelCase(result.rows[0]);
  },

  // Find by id and update
  async findByIdAndUpdate(id, updates, options = {}) {
    const allowedCols = [
      'company_name', 'company_logo_url', 'application_form_url', 'location', 'field', 'status',
      'approval_status', 'short_description', 'full_description', 'required_skills',
      'duration', 'deadline', 'website', 'admin_notes', 'approved_at'
    ];

    const setParts = [];
    const values = [];
    let i = 1;

    Object.keys(updates).forEach(key => {
      const col = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedCols.includes(col) && updates[key] !== undefined) {
        setParts.push(`${col} = $${i++}`);
        values.push(updates[key]);
      }
    });

    if (setParts.length === 0) return this.findById(id);

    setParts.push('updated_at = NOW()');
    values.push(id);

    const result = await pool.query(`
      UPDATE internships SET ${setParts.join(', ')} WHERE id = $${i}
      RETURNING *
    `, values);
    return result.rows[0] ? this.toCamelCase(result.rows[0]) : null;
  },

  // Delete by id
  async findByIdAndDelete(id) {
    const result = await pool.query('DELETE FROM internships WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  },

  // Convert snake_case row to camelCase object (mimics mongoose doc)
  toCamelCase(row) {
    if (!row) return null;
    return {
      id: row.id,
      _id: row.id,
      companyName: row.company_name,
      companyLogoUrl: row.company_logo_url,
      applicationFormUrl: row.application_form_url,
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
      submittedBy: {
        id: row.submitted_by,
        _id: row.submitted_by,
        fullName: row.submitted_by_name,
        email: row.submitted_by_email,
      },
      adminNotes: row.admin_notes,
      approvedAt: row.approved_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      submittedByName: row.submitted_by_name,
      submittedByEmail: row.submitted_by_email,
    };
  },
};

module.exports = Internship;
