const pool = require('../db');

exports.createOrder = async (req, res) => {
  const { product_id, quantity } = req.body;
  try {
    // Get product price
    const productResult = await pool.query(
      'SELECT price FROM products WHERE id = $1',
      [product_id]
    );
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const price = productResult.rows[0].price;
    const total_amount = price * quantity;
    
    const order = await pool.query(
      'INSERT INTO orders (user_id, product_id, quantity, total_amount) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, product_id, quantity, total_amount]
    );
    res.status(201).json(order.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.id, p.name, p.price, o.quantity, o.created_at
       FROM orders o
       JOIN products p ON p.id = o.product_id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update an order
exports.updateOrder = async (req, res) => {
  const { product_id, quantity } = req.body;
  const { id } = req.params;

  try {
    // Get product price
    const productResult = await pool.query(
      'SELECT price FROM products WHERE id = $1',
      [product_id]
    );
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const price = productResult.rows[0].price;
    const total_amount = price * quantity;
    
    const result = await pool.query(
      `UPDATE orders
       SET product_id = $1, quantity = $2, total_amount = $3
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [product_id, quantity, total_amount, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete an order
exports.deleteOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM orders WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found or unauthorized' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.placeOrderFromCart = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Get user's cart
    const cartItems = await client.query(
      `SELECT * FROM cart WHERE user_id = $1`,
      [req.user.id]
    );

    if (cartItems.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const orderItems = [];

    // 2. Insert each cart item as an order
    for (const item of cartItems.rows) {
      // Get product price
      const productResult = await client.query(
        'SELECT price FROM products WHERE id = $1',
        [item.product_id]
      );
      
      if (productResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: `Product with id ${item.product_id} not found` });
      }
      
      const price = productResult.rows[0].price;
      const total_amount = price * item.quantity;
      
      const result = await client.query(
        `INSERT INTO orders (user_id, product_id, quantity, total_amount)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [req.user.id, item.product_id, item.quantity, total_amount]
      );
      orderItems.push(result.rows[0]);
    }

    // 3. Clear cart
    await client.query(
      `DELETE FROM cart WHERE user_id = $1`,
      [req.user.id]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Order placed successfully', order: orderItems });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};


