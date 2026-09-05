/**
 * Global Error Handler - Trạm gác cuối cùng bắt mọi lỗi trong ứng dụng.
 * Giúp mã nguồn Controller sạch hơn (không cần try-catch rườm rà ở mọi nơi)
 * và định dạng lại cấu trúc lỗi trả về cho Client một cách đồng nhất.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Log lỗi ra console để debug, giấu chi tiết stack trace nếu ở môi trường Production
  console.error('[Unhandled Error]', {
    message : err.message,
    stack   : process.env.NODE_ENV === 'production' ? '(hidden)' : err.stack,
    path    : req.path,
    method  : req.method,
  });

  // Bắt lỗi Validation của Mongoose (ví dụ: thiếu trường bắt buộc, sai định dạng)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Du lieu khong hop le', errors: messages });
  }

  // Lỗi sai định dạng ObjectId hoặc kiểu dữ liệu của Mongoose
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Gia tri truong '${err.path}' khong hop le` });
  }

  // Bắt lỗi trùng lặp dữ liệu của MongoDB (Duplicate Key Error - Unique Index)
  // Thường xảy ra khi tạo User mới mà email đã tồn tại
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({ message: `Gia tri '${field}' da ton tai` });
  }

  // Bắt lỗi khi người dùng gửi chuỗi JSON bị hỏng (Malformed JSON)
  // Ví dụ: body bị cắt cụt, sai cú pháp dấu ngoặc kép.
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({ message: 'Request body khong phai JSON hop le' });
  }

  // Lỗi mặc định (Lỗi hệ thống không lường trước được)
  return res.status(500).json({
    message: 'Loi server noi bo',
    // Chỉ ném chi tiết lỗi ra ngoài nếu đang ở môi trường phát triển (Development)
    ...(process.env.NODE_ENV !== 'production' && { detail: err.message }),
  });
};

module.exports = errorHandler;
