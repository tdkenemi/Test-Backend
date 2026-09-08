const jwt = require('jsonwebtoken');

// Lấy khóa bí mật từ biến môi trường (.env) — bắt buộc phải có
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('[authMiddleware] JWT_SECRET chưa được cấu hình trong file .env');

/**
 * Middleware Kiểm tra và xác thực JWT Token (Bảo vệ API).
 * Bất kỳ route nào gắn middleware này đều bắt buộc client phải gửi Token hợp lệ.
 */
const authMiddleware = (req, res, next) => {
  // Lấy Header Authorization từ Request (Ví dụ: "Bearer eyJhb...")
  const authHeader = req.headers['authorization'];

  // 1. Kiểm tra xem header có tồn tại và đúng định dạng Bearer Token không
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Thieu token xac thuc' });
  }

  // 2. Tách chuỗi để lấy phần thân của Token
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token khong hop le' });
  }

  try {
    // 3. Tiến hành xác thực Token bằng JWT_SECRET
    // Nếu token giả mạo, hoặc hết hạn, jwt.verify sẽ văng ra (throw) Error.
    const decoded = jwt.verify(token, JWT_SECRET);

    // 4. Nếu hợp lệ, giải mã Token để lấy thông tin userId và email.
    // Gắn thông tin này vào req.user để các Controller phía sau sử dụng.
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    // 5. Cho phép đi tiếp vào Controller đích (Route handler)
    next();
  } catch (error) {
    // 6. Xử lý các loại lỗi từ thư viện jsonwebtoken
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token da het han' });
    }
    // Lỗi Token bị chỉnh sửa, sai cấu trúc, v.v...
    return res.status(401).json({ message: 'Token khong hop le' });
  }
};

module.exports = authMiddleware;
