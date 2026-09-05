// Hằng số định nghĩa cấu hình bảo vệ (Brute-force)
const MAX_ATTEMPTS  = 5;          // Cho phép sai tối đa 5 lần
const WINDOW_MS     = 60 * 1000; // Khung thời gian theo dõi (1 phút)
const LOCKOUT_MS    = 60 * 1000; // Thời gian phạt khóa (1 phút)

// Sử dụng Map lưu trữ trong RAM (In-Memory). Dùng cho môi trường 1 node.
// Trong thực tế (hệ thống lớn/microservices), phần này sẽ được thay thế bằng Redis.
const loginAttempts = new Map();

/**
 * Lấy hoặc khởi tạo Record theo dõi số lần sai của một email.
 * 
 * @param {string} email - Email cần lấy record
 * @returns {object} Object chứa thông tin đếm số lần sai
 */
const getRecord = (email) => {
  if (!loginAttempts.has(email)) {
    // Khởi tạo nếu chưa tồn tại
    loginAttempts.set(email, { count: 0, lockedUntil: null, windowStart: Date.now() });
  }
  return loginAttempts.get(email);
};

/** 
 * Kiểm tra xem tài khoản (email) có đang trong trạng thái khóa phạt hay không. 
 * 
 * @param {object} record - Record được lấy ra từ getRecord
 * @returns {boolean} True nếu đang bị khóa, False nếu được phép truy cập
 */
const isLocked = (record) => {
  // Nếu vẫn còn thời hạn khóa
  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    return true;
  }
  
  // Nếu thời hạn khóa đã qua -> Tự động mở khóa (Reset lại bộ đếm)
  if (record.lockedUntil && Date.now() >= record.lockedUntil) {
    record.count       = 0;
    record.lockedUntil = null;
    record.windowStart = Date.now();
  }
  
  return false; // Không bị khóa
};

/** 
 * Hàm được gọi mỗi khi người dùng đăng nhập SAI mật khẩu (hoặc sai email).
 * Sẽ đếm số lần sai và tự động đặt trạng thái Khóa (lockedUntil) nếu vượt ngưỡng.
 * 
 * @param {string} email - Email vừa đăng nhập thất bại
 */
const recordFailure = (email) => {
  const record = getRecord(email);

  // Nếu lần đăng nhập sai gần nhất đã cách đây HƠN 1 phút (khung thời gian Window)
  // thì ta tha lỗi, reset lại bộ đếm từ đầu.
  if (Date.now() - record.windowStart >= WINDOW_MS) {
    record.count       = 0;
    record.windowStart = Date.now();
    record.lockedUntil = null;
  }

  // Tăng số lần sai
  record.count += 1;

  // Nếu quá 5 lần sai, khóa tài khoản trong 1 phút kể từ bây giờ
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_MS;
  }
};

/** 
 * Hàm được gọi khi người dùng đăng nhập THÀNH CÔNG.
 * Chức năng: Xóa toàn bộ lịch sử đếm sai của email này khỏi RAM, dọn dẹp bộ nhớ.
 */
const resetRecord = (email) => {
  loginAttempts.delete(email); // Xóa khỏi Map
};

module.exports = {
  MAX_ATTEMPTS,
  LOCKOUT_MS,
  getRecord,
  isLocked,
  recordFailure,
  resetRecord
};
