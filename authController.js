const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('./models');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// ────────────────────────────────────────────────────────────
//  Brute-force protection - In-memory store (Map)
//
//  loginAttempts: Map<email, { count: number, lockedUntil: number | null }>
//
//  Quy tac:
//    - Sai password -> count++
//    - count >= MAX_ATTEMPTS -> khoa email trong LOCKOUT_MS
//    - Dung password (truoc khi dat gioi han) -> reset count ve 0
//    - Trong thoi gian khoa: moi request (ke ca dung password) -> 429
// ────────────────────────────────────────────────────────────
const MAX_ATTEMPTS  = 5;
const WINDOW_MS     = 60 * 1000; // 1 phut
const LOCKOUT_MS    = 60 * 1000; // bi khoa 1 phut

const loginAttempts = new Map();

/**
 * Lay hoac khoi tao record cho email.
 * Tu dong don dep record het thoi gian de tranh Memory Leak.
 */
const getRecord = (email) => {
  if (!loginAttempts.has(email)) {
    loginAttempts.set(email, { count: 0, lockedUntil: null, windowStart: Date.now() });
  }
  return loginAttempts.get(email);
};

/** Kiem tra email co dang bi khoa khong. */
const isLocked = (record) => {
  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    return true;
  }
  // Het thoi gian khoa -> reset
  if (record.lockedUntil && Date.now() >= record.lockedUntil) {
    record.count       = 0;
    record.lockedUntil = null;
    record.windowStart = Date.now();
  }
  return false;
};

/** Ghi nhan lan dang nhap sai. */
const recordFailure = (email) => {
  const record = getRecord(email);

  // Neu cua so 1 phut da qua, reset dem
  if (Date.now() - record.windowStart >= WINDOW_MS) {
    record.count       = 0;
    record.windowStart = Date.now();
    record.lockedUntil = null;
  }

  record.count += 1;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_MS;
  }
};

/** Reset dem sau khi dang nhap thanh cong. */
const resetRecord = (email) => {
  loginAttempts.delete(email);
};

// ────────────────────────────────────────────────────────────
//  Helper: Validate email format
// ────────────────────────────────────────────────────────────
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ────────────────────────────────────────────────────────────
//  POST /register
// ────────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- Validation ---
    if (!email || !password) {
      return res.status(400).json({ message: 'Email va password la bat buoc' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Email khong hop le' });
    }

    if (password.length <= 6) {
      return res.status(400).json({ message: 'Password phai lon hon 6 ky tu' });
    }

    // --- Hash password ---
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // --- Luu vao DB ---
    const newUser = await User.create({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    return res.status(201).json({
      message: 'Dang ky thanh cong',
      userId: newUser._id,
    });
  } catch (error) {
    // [YEU CAU BAI TEST]: Xu ly race-condition / concurrency khi dang ky
    // Khi co 2 request dong thoi dang ky cung 1 email, chi 1 request qua duoc
    // Request thu 2 bi MongoDB reject voi ma loi 11000 (Duplicate Key Error)
    // do truong `email` da duoc set `unique: true` trong models.js
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email da ton tai' });
    }

    console.error('[register] Error:', error);
    return res.status(500).json({ message: 'Loi server noi bo' });
  }
};

// ────────────────────────────────────────────────────────────
//  POST /login 
//  [YEU CAU BAI TEST]: Tinh nang Chong do mat khau (Brute-force protection)
//  - Chan request 1 phut neu sai pass 5 lan lien tiep.
//  - Duoc xay dung dua tren in-memory Map thay vi Redis de don gian hoa,
//    dung nhu yeu cau (Khong over-engineer).
// ────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- Validation co ban ---
    if (!email || !password) {
      return res.status(400).json({ message: 'Email va password la bat buoc' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── [1] Kiem tra khoa TRUOC khi truy van DB ──
    const record = getRecord(normalizedEmail);

    if (isLocked(record)) {
      const remainingSec = Math.ceil((record.lockedUntil - Date.now()) / 1000);
      return res.status(429).json({
        message: `Tai khoan tam bi khoa do dang nhap sai qua nhieu lan. Thu lai sau ${remainingSec} giay.`,
        retryAfterSeconds: remainingSec,
      });
    }

    // ── [2] Tim user trong DB ──
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Van ghi nhan that bai de tranh username enumeration attack
      recordFailure(normalizedEmail);
      return res.status(401).json({ message: 'Email hoac password khong chinh xac' });
    }

    // ── [3] So sanh password ──
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      recordFailure(normalizedEmail);

      // Tinh so lan con lai truoc khi bi khoa
      const updatedRecord = getRecord(normalizedEmail);
      const remaining     = MAX_ATTEMPTS - updatedRecord.count;

      if (updatedRecord.lockedUntil) {
        // Vua vuot gioi han -> thong bao khoa
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

    // ── [4] Dang nhap thanh cong -> reset bo dem ──
    resetRecord(normalizedEmail);

    // ── [5] Cap JWT token (han 1h) ──
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
