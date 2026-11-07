const pool = require('../config/db');

const User = {
  // Find one user by filter object (supports: email, id, refreshToken, role, university)
  async findOne(filter) {
    let sql = 'SELECT * FROM users WHERE ';
    const conditions = [];
    const values = [];
    let i = 1;

    if (filter.email) { conditions.push(`email = $${i++}`); values.push(filter.email); }
    if (filter.id) { conditions.push(`id = $${i++}`); values.push(filter.id); }
    if (filter.refreshToken) { conditions.push(`refresh_token = $${i++}`); values.push(filter.refreshToken); }
    if (filter.role) { conditions.push(`role = $${i++}`); values.push(filter.role); }
    if (filter.university) { conditions.push(`university = $${i++}`); values.push(filter.university); }

    sql += conditions.join(' AND ');
    sql += ' LIMIT 1';

    const result = await pool.query(sql, values);
    return result.rows[0] || null;
  },

  // Find by id
  async findById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  // Create a new user
  async create(data) {
    const {
      email, passwordHash, role = 'STUDENT', fullName, university = '',
      department = '', year, experienceLevel = 'Beginner', goal,
      interests = [], location, bankAccount
    } = data;

    const sql = `
      INSERT INTO users (email, password_hash, role, full_name, university, department, year,
        experience_level, goal, interests, location, bank_account)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
    `;
    const values = [
      email, passwordHash, role, fullName, university, department, year,
      experienceLevel, goal, interests, location, bankAccount
    ];
    const result = await pool.query(sql, values);
    return result.rows[0];
  },

  // Find many with optional filter and select fields
  async find(filter = {}, selectFields = null) {
    let sql = 'SELECT * FROM users';
    const conditions = [];
    const values = [];
    let i = 1;

    if (filter.role) { conditions.push(`role = $${i++}`); values.push(filter.role); }
    if (filter.university) { conditions.push(`university = $${i++}`); values.push(filter.university); }

    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY created_at DESC';

    const result = await pool.query(sql, values);
    let rows = result.rows;

    if (selectFields) {
      rows = rows.map(row => {
        const obj = {};
        selectFields.split(' ').forEach(f => {
          const snakeKey = f.replace(/([A-Z])/g, '_$1').toLowerCase();
          obj[f] = row[snakeKey];
        });
        return obj;
      });
    }

    return rows;
  },

  // Find by id and update
  async findByIdAndUpdate(id, updates, options = {}) {
    const allowedCols = [
      'full_name', 'department', 'university', 'year', 'experience_level',
      'goal', 'interests', 'location', 'bank_account', 'role', 'refresh_token'
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

    setParts.push(`updated_at = NOW()`);
    values.push(id);

    const sql = `
      UPDATE users SET ${setParts.join(', ')} WHERE id = $${i}
      RETURNING *
    `;
    const result = await pool.query(sql, values);
    return result.rows[0] || null;
  },

  // Instance-style save (used for refresh token updates)
  async save(user) {
    const sql = `
      UPDATE users SET refresh_token = $1, updated_at = NOW() WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(sql, [user.refreshToken, user.id]);
    return result.rows[0] || user;
  },

  // Convert row to plain object (mimics mongoose toObject)
  toObject(row) {
    if (!row) return null;
    return {
      id: row.id,
      _id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      fullName: row.full_name,
      department: row.department,
      university: row.university,
      year: row.year,
      experienceLevel: row.experience_level,
      goal: row.goal,
      interests: row.interests || [],
      location: row.location,
      bankAccount: row.bank_account,
      refreshToken: row.refresh_token,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  },
};

module.exports = User;
