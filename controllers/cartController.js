const pool = require('../db');

// Add to Cart
exports.addToCart = async (req, res) => {
  const { product_id, quantity } = req.body;
  try {
    const result = await pool.query(
        `INSERT INTO cart (user_id, product_id, quantity)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, product_id)
        DO UPDATE SET quantity = cart.quantity + $3
        RETURNING *`,
        [req.user.id, product_id, quantity]
);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// View Cart
exports.viewCart = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, p.name, p.price, p.description, p.rating, c.quantity, (p.price * c.quantity) AS total
       FROM cart c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id = $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Cart Quantity
exports.updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE cart SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
      [quantity, id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove from Cart
exports.removeCartItem = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING *`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
