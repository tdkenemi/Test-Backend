// ============================================================
//  server.js — Entry point
//  Express + Mongoose + JWT  (Trieu Duy Khang)
// ============================================================
require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');

// ── Import controllers & middleware ──────────────────────────
const { register, login }    = require('./authController');
const { authMiddleware }      = require('./middlewares');
const { getMe, getProducts }  = require('./productController');

const app  = express();
const PORT = process.env.PORT || 3000;

// ============================================================
//  1. GLOBAL MIDDLEWARE
// ============================================================

// Parse JSON body; neu body JSON bi loi cu phap, Express nem SyntaxError
app.use(express.json());

// [BUG FIX] Bat JSON SyntaxError ngay sau express.json().
// PHAI co du 4 tham so (err, req, res, next) thi Express moi nhan day
// la error-handling middleware. Neu chi co 3 tham so no se bi bo qua.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Request body khong phai JSON hop le' });
  }
  next(err);
});

// ============================================================
//  2. ROUTES
// ============================================================

// --- Auth (public) ---
app.post('/register', register);
app.post('/login',    login);

// --- Protected (yeu cau JWT hop le) ---
app.get('/me',       authMiddleware, getMe);
app.get('/products', authMiddleware, getProducts);

// --- 404 handler: bat route khong ton tai ---
app.use((req, res) => {
  res.status(404).json({ message: `Route [${req.method} ${req.path}] khong ton tai` });
});

// ============================================================
//  3. GLOBAL ERROR HANDLING MIDDLEWARE
//  Phai co du 4 tham so (err, req, res, next) de Express nhan dang
// ============================================================

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', {
    message : err.message,
    stack   : process.env.NODE_ENV === 'production' ? '(hidden)' : err.stack,
    path    : req.path,
    method  : req.method,
  });

  // Mongoose ValidationError (vi du: sai enum Product.status)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Du lieu khong hop le', errors: messages });
  }

  // Mongoose CastError (vi du: ObjectId sai dinh dang)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Gia tri truong '${err.path}' khong hop le` });
  }

  // MongoDB duplicate key (fallback, authController da xu ly 11000 roi)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({ message: `Gia tri '${field}' da ton tai` });
  }

  // JSON parse error tu express.json() (backup, da xu ly tren)
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({ message: 'Request body khong phai JSON hop le' });
  }

  // Tat ca loi khac -> 500
  return res.status(500).json({
    message: 'Loi server noi bo',
    // Chi lo chi tiet loi trong moi truong dev
    ...(process.env.NODE_ENV !== 'production' && { detail: err.message }),
  });
});

// ============================================================
//  4. KHOI DONG SERVER
// ============================================================
const startServer = async () => {
  try {
    // Ket noi MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB da ket noi thanh cong');

    // Bat dau lang nghe request
    app.listen(PORT, () => {
      console.log(`Server dang chay tai http://localhost:${PORT}`);
      console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('Khong the ket noi MongoDB:', err.message);
    // Thoat tien trinh neu DB khong ket noi duoc (giup Docker / PM2 tu restart)
    process.exit(1);
  }
};

// Bat loi promise chua duoc xu ly (vi du: mongoose query khong co .catch())
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

// Bat exception dong bo chua duoc xu ly
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err.message);
  process.exit(1);
});

startServer();
