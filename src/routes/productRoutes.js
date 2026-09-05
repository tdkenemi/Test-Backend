const express = require('express');
const { getMe, getProducts } = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Áp dụng authMiddleware trực tiếp trên từng route
// (Không dùng router.use() để route lạ vẫn fall-through đúng vào 404 handler)
router.get('/me', authMiddleware, getMe);
router.get('/products', authMiddleware, getProducts);

module.exports = router;
