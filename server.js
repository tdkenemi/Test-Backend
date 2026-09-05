require('dotenv').config();

const express = require('express');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middlewares/errorHandler');
const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON body
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api', productRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route [${req.method} ${req.path}] không tồn tại` });
});

// Global Error Handler
app.use(errorHandler);

// Khoi dong server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server dang chay tai http://localhost:${PORT}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  });
};

process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err.message);
  process.exit(1);
});

startServer();
