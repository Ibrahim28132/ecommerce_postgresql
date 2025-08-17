const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

// ✅ Register (with optional image)
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const file = req.file;

  try {
    const hashed = await bcrypt.hash(password, 10);
    const profile_image = file ? `/uploads/${file.filename}` : null;

    const user = await pool.query(
      `INSERT INTO users (name, email, password, profile_image)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, profile_image`,
      [name, email, hashed, profile_image]
    );

    res.status(201).json(user.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userRes.rows.length === 0)
      return res.status(404).json({ error: 'User not found' });

    const user = userRes.rows[0];

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '1d' });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Logout
exports.logout = async (req, res) => {
  res.json({ message: 'Logged out. Please delete the token on client side.' });
};

// ✅ GET /api/users/profile
exports.getProfile = async (req, res) => {
  try {
    const { id, name, email, role, profile_image } = req.user;
    res.json({ id, name, email, role, profile_image });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// ✅ PUT /api/users/profile (update info and image)
exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email } = req.body;
  const file = req.file;
  const profile_image = file ? `/uploads/${file.filename}` : null;

  try {
    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name), 
           email = COALESCE($2, email), 
           profile_image = COALESCE($3, profile_image)
       WHERE id = $4 
       RETURNING id, name, email, role, profile_image`,
      [name, email, profile_image, userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// ✅ PUT /api/users/password (change password)
exports.changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  try {
    const userRes = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);

    if (userRes.rows.length === 0)
      return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(currentPassword, userRes.rows[0].password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, userId]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update password' });
  }
};
