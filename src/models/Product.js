const mongoose = require('mongoose');

/**
 * Schema Mongoose cho Collection `products`.
 * Định nghĩa cấu trúc dữ liệu và các ràng buộc (Validation) ở tầng Database.
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true, // Tự động xóa khoảng trắng ở 2 đầu
    },
    status: {
      type: String,
      // Chỉ cho phép 3 trạng thái này, nếu nhập sai MongoDB sẽ báo lỗi ValidationError
      enum: {
        values: ['available', 'out_of_stock', 'discontinued'],
        message: "Status phai la 'available', 'out_of_stock' hoac 'discontinued'",
      },
    },
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

module.exports = mongoose.model('Product', productSchema);
