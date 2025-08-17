const jwt = require('jsonwebtoken');
const pool = require('../db');
const SECRET = process.env.JWT_SECRET;

module.exports = async function (req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const decoded = jwt.verify(token, SECRET);

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = result.rows[0]; // Attach full user (id, email, name, role, etc.)
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};


