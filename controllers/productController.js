const pool = require('../db');
const path = require('path');

exports.createProduct = async (req, res) => {
  const { name, price, in_stock, category, description, rating } = req.body;
  const file = req.file;

  try {
    const catResult = await pool.query(
      'SELECT id FROM categories WHERE name = $1',
      [category]
    );

    if (catResult.rows.length === 0) {
      return res.status(400).json({ error: `Category '${category}' not found` });
    }

    const category_id = catResult.rows[0].id;
    const product_image = file ? `/uploads/products/${file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO products (name, price, in_stock, category_id, description, rating, product_image)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, price, in_stock, category_id, description, rating, product_image]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getProducts = async (req, res) => {
  const { name, min_price, max_price, min_rating, page = 1, limit = 10, sort = 'created_at_desc' } = req.query;
  const filters = [];
  const values = [];

  let query = `
    SELECT p.*, c.name AS category, 
           COALESCE(AVG(r.rating), 0)::numeric(2,1) AS average_rating
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN reviews r ON r.product_id = p.id
  `;

  if (name) {
    values.push(`%${name}%`);
    filters.push(`p.name ILIKE $${values.length}`);
  }

  if (min_price) {
    values.push(min_price);
    filters.push(`p.price >= $${values.length}`);
  }

  if (max_price) {
    values.push(max_price);
    filters.push(`p.price <= $${values.length}`);
  }

  if (filters.length > 0) {
    query += ` WHERE ` + filters.join(' AND ');
  }

  query += ` GROUP BY p.id, c.name`;

  if (min_rating) {
    values.push(min_rating);
    query = `
      SELECT * FROM (${query}) AS sub
      WHERE sub.average_rating >= $${values.length}
    `;
  }

  const offset = (page - 1) * limit;
  const [sortField, sortOrder] = sort.split('_');
  const validSortFields = ['name', 'price', 'rating', 'created_at'];
  const validSortOrder = ['asc', 'desc'];

  const safeField = validSortFields.includes(sortField) ? sortField : 'created_at';
  const safeOrder = validSortOrder.includes(sortOrder) ? sortOrder : 'desc';

  query += ` ORDER BY ${safeField} ${safeOrder}`;
  query += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
  values.push(limit, offset);

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  const productId = req.params.id;
  const { name, price, in_stock, category, description, rating } = req.body;
  const file = req.file;

  try {
    let category_id = null;
    if (category) {
      const catResult = await pool.query('SELECT id FROM categories WHERE name = $1', [category]);
      if (catResult.rows.length === 0) {
        return res.status(400).json({ error: `Category '${category}' not found` });
      }
      category_id = catResult.rows[0].id;
    }

    const product_image = file ? `/uploads/products/${file.filename}` : null;

    const result = await pool.query(
      `UPDATE products
       SET name = COALESCE($1, name),
           price = COALESCE($2, price),
           in_stock = COALESCE($3, in_stock),
           category_id = COALESCE($4, category_id),
           description = COALESCE($5, description),
           rating = COALESCE($6, rating),
           product_image = COALESCE($7, product_image)
       WHERE id = $8
       RETURNING *`,
      [name, price, in_stock, category_id, description, rating, product_image, productId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
