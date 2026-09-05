const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

// ────────────────────────────────────────────────────────────
// Public Routes (Không yêu cầu xác thực JWT)
// ────────────────────────────────────────────────────────────
router.post('/register', register); // API: Đăng ký tài khoản
router.post('/login', login);       // API: Đăng nhập & cấp Token

module.exports = router;
