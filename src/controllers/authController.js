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

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

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

    if (!email || !password) {
      return res.status(400).json({ message: 'Email va password la bat buoc' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Email khong hop le' });
    }

    if (password.length <= 6) {
      return res.status(400).json({ message: 'Password phai lon hon 6 ky tu' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await User.create({
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    return res.status(201).json({
      message: 'Dang ky thanh cong',
      userId: newUser._id,
    });
  } catch (error) {
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
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email va password la bat buoc' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const record = getRecord(normalizedEmail);

    if (isLocked(record)) {
      const remainingSec = Math.ceil((record.lockedUntil - Date.now()) / 1000);
      return res.status(429).json({
        message: `Tai khoan tam bi khoa do dang nhap sai qua nhieu lan. Thu lai sau ${remainingSec} giay.`,
        retryAfterSeconds: remainingSec,
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      recordFailure(normalizedEmail);
      return res.status(401).json({ message: 'Email hoac password khong chinh xac' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
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

    resetRecord(normalizedEmail);

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
