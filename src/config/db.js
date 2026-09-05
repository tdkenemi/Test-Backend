const mongoose = require('mongoose');

/**
 * Hàm kết nối tới Cơ sở dữ liệu MongoDB.
 * Lấy URL kết nối từ file môi trường (.env).
 */
const connectDB = async () => {
  try {
    // Kết nối tới MongoDB thông qua Mongoose ORM
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB da ket noi thanh cong');
  } catch (err) {
    console.error('Khong the ket noi MongoDB:', err.message);
    // Dừng toàn bộ server nếu không thể kết nối tới DB, 
    // vì thiếu DB thì các tính năng khác cũng không hoạt động được.
    process.exit(1);
  }
};

module.exports = connectDB;
