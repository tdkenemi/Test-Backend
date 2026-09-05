const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { 
  MAX_ATTEMPTS, 
  LOCKOUT_MS, 
  getRecord, 
  isLocked, 
  recordFailure, 
  resetRecord 
} = require('../services/loginAttemptsService');

// Số vòng băm muối cho bcrypt, 10 là mức độ cân bằng tốt giữa bảo mật và hiệu năng
const SALT_ROUNDS = 10;
// Khóa bí mật dùng để mã hóa và giải mã JWT Token (cần bảo mật tuyệt đối trên server)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// ────────────────────────────────────────────────────────────
//  Helper: Validate email format
// ────────────────────────────────────────────────────────────
/**
 * Hàm kiểm tra định dạng email bằng Regular Expression.
 * Đảm bảo email nhập vào phải có ký tự @ và dấu chấm (.) hợp lệ.
 * 
 * @param {string} email - Chuỗi email cần kiểm tra
 * @returns {boolean} True nếu đúng định dạng, False nếu sai
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ────────────────────────────────────────────────────────────
//  POST /register
// ────────────────────────────────────────────────────────────
/**
 * Controller xử lý đăng ký tài khoản mới.
 * Sử dụng cơ chế băm mật khẩu bcrypt và tận dụng Index Unique của MongoDB
 * để chống lỗi Race-Condition khi có nhiều request đăng ký cùng lúc.
 */
const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Kiểm tra đầu vào có trống không
    if (!email || !password) {
      return res.status(400).json({ message: 'Email va password la bat buoc' });
    }

    // 2. Kiểm tra định dạng email
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Email khong hop le' });
    }

    // 3. Kiểm tra độ dài mật khẩu tối thiểu (tăng cường bảo mật)
    if (password.length <= 6) {
      return res.status(400).json({ message: 'Password phai lon hon 6 ky tu' });
    }

    // 4. Băm mật khẩu (Hash) trước khi lưu vào DB để chống lộ lọt data
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 5. Tạo User mới trong Database
    const newUser = await User.create({
      email: email.toLowerCase().trim(), // Chuẩn hóa email về chữ thường
      password: hashedPassword,
    });

    // 6. Trả về thành công
    return res.status(201).json({
      message: 'Dang ky thanh cong',
      userId: newUser._id,
    });
  } catch (error) {
    // 7. Bắt lỗi Duplicate Key (mã lỗi 11000) từ MongoDB.
    // Lỗi này xảy ra khi email đã tồn tại (do ta dùng unique: true trong Schema).
    // Kể cả 2 request đến cùng mili-giây, MongoDB vẫn chặn lại ở tầng Storage Engine.
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email da ton tai' });
    }
    console.error('[register] Error:', error);
    return res.status(500).json({ message: 'Loi server noi bo' });
  }
};

// ────────────────────────────────────────────────────────────
//  POST /login
// ────────────────────────────────────────────────────────────
/**
 * Controller xử lý đăng nhập.
 * Được bảo vệ khỏi tấn công Brute-Force bằng In-Memory Map Service.
 * Chống Enumeration Attack bằng cách báo lỗi chung chung (sai email hoặc mật khẩu).
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Kiểm tra đầu vào
    if (!email || !password) {
      return res.status(400).json({ message: 'Email va password la bat buoc' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Lấy thông tin Brute-force record của email này
    const record = getRecord(normalizedEmail);

    // 3. [Bảo mật] Kiểm tra xem tài khoản có đang bị khóa (Lockout) không
    if (isLocked(record)) {
      const remainingSec = Math.ceil((record.lockedUntil - Date.now()) / 1000);
      return res.status(429).json({ // 429 Too Many Requests
        message: `Tai khoan tam bi khoa do dang nhap sai qua nhieu lan. Thu lai sau ${remainingSec} giay.`,
        retryAfterSeconds: remainingSec,
      });
    }

    // 4. Tìm user trong database
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Dù user không tồn tại, vẫn ghi nhận là đăng nhập sai để tránh hacker dò tìm tài khoản
      recordFailure(normalizedEmail);
      return res.status(401).json({ message: 'Email hoac password khong chinh xac' });
    }

    // 5. So sánh mật khẩu băm với password đầu vào
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // 6. Mật khẩu sai: Tăng bộ đếm và kiểm tra khóa tài khoản
      recordFailure(normalizedEmail);

      const updatedRecord = getRecord(normalizedEmail);
      const remaining     = MAX_ATTEMPTS - updatedRecord.count;

      if (updatedRecord.lockedUntil) {
        return res.status(429).json({
          message: `Dang nhap sai qua ${MAX_ATTEMPTS} lan. Tai khoan bi khoa trong 1 phut.`,
          retryAfterSeconds: Math.ceil(LOCKOUT_MS / 1000),
        });
      }

      return res.status(401).json({
        message: `Email hoac password khong chinh xac. Con ${remaining} lan thu truoc khi bi khoa.`,
        attemptsRemaining: remaining,
      });
    }

    // 7. Mật khẩu đúng: Hủy bỏ đếm sai (Reset Brute-force Record)
    resetRecord(normalizedEmail);

    // 8. Ký JWT Token cấp phép truy cập (hạn dùng 1 tiếng)
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: 'Dang nhap thanh cong',
      token,
    });
  } catch (error) {
    console.error('[login] Error:', error);
    return res.status(500).json({ message: 'Loi server noi bo' });
  }
};

module.exports = { register, login };
