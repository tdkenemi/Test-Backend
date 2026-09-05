const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB da ket noi thanh cong');
  } catch (err) {
    console.error('Khong the ket noi MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
