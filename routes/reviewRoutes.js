/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Product reviews
 */
/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Add or update a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review added/updated
 */
/**
 * @swagger
 * /api/reviews/{product_id}:
 *   get:
 *     summary: Get reviews for a product
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reviews
 */

const express = require('express');
const router = express.Router();
const controller = require('../controllers/reviewController');
const auth = require('../middleware/auth');

// POST /api/reviews
router.post('/', auth, controller.addReview);

// GET /api/reviews/:product_id
router.get('/:product_id', controller.getProductReviews);

module.exports = router;
