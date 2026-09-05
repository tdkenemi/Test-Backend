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

module.exports = {
  MAX_ATTEMPTS,
  LOCKOUT_MS,
  getRecord,
  isLocked,
  recordFailure,
  resetRecord
};
