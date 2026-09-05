const express = require('express');
const { getMe, getProducts } = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Áp dụng middleware xác thực (`authMiddleware`) TRỰC TIẾP lên từng API.
// Giải thích: Không sử dụng `router.use(authMiddleware)` ở đây vì nếu làm vậy,
// các Route lạ (VD: GET /api/xyz) sẽ bị bắt bởi JWT middleware trước và trả về 401 
// (thay vì trả về 404 Route Not Found theo đúng logic).
// ────────────────────────────────────────────────────────────
// Protected Routes (Yêu cầu phải có Token hợp lệ)
// ────────────────────────────────────────────────────────────
router.get('/me', authMiddleware, getMe);
router.get('/products', authMiddleware, getProducts);

module.exports = router;
