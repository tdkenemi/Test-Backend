const mongoose = require('mongoose');

/**
 * Schema Mongoose cho Collection `users`.
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email la bat buoc'], // Bắt buộc phải có
      // unique: true sẽ tạo một Index (Unique Index) ở mức Database.
      // Đây là giải pháp hoàn hảo để chặn Race-condition (nhiều người đăng ký cùng lúc).
      // Mọi thao tác lưu email trùng lặp đều bị MongoDB chặn và trả về mã lỗi 11000.
      unique: true, 
      lowercase: true, // Tự động chuyển thành chữ thường trước khi lưu
      trim: true,      // Cắt khoảng trắng dư thừa
    },
    password: {
      type: String,
      required: [true, 'Password la bat buoc'],
    },
  },
  { timestamps: true } // Tự động quản lý ngày tạo (createdAt) và cập nhật (updatedAt)
);

module.exports = mongoose.model('User', userSchema);
