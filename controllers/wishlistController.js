const pool = require('../db');

// Add to wishlist
exports.addToWishlist = async (req, res) => {
  const { product_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO wishlist (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING
       RETURNING *`,
      [req.user.id, product_id]
    );
    if (result.rows.length === 0) {
      return res.status(200).json({ message: 'Already in wishlist' });
    }
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM wishlist WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT w.id, p.*
       FROM wishlist w
       JOIN products p ON p.id = w.product_id
       WHERE w.user_id = $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
