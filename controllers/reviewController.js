const pool = require('../db');

// Create or Update Review
exports.addReview = async (req, res) => {
  const { product_id, rating, comment } = req.body;
  const user_id = req.user.id;

  try {
    // Upsert: one review per user per product
    const result = await pool.query(
      `INSERT INTO reviews (user_id, product_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment
       RETURNING *`,
      [user_id, product_id, rating, comment]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Reviews by Product
exports.getProductReviews = async (req, res) => {
  const { product_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT r.id, u.name AS user, r.rating, r.comment, r.created_at
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [product_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
