const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// ────────────────────────────────────────────────────────────
//  authMiddleware - Verify JWT from "Authorization: Bearer <token>"
// ────────────────────────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Kiem tra header co ton tai va dung dinh dang "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Thieu token xac thuc' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token khong hop le' });
  }

  try {
    // Verify va giai ma token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Gan payload vao req.user de cac handler sau dung
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    // JsonWebTokenError: sai chu ky / bi sua
    // TokenExpiredError: het han
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token da het han' });
    }
    return res.status(401).json({ message: 'Token khong hop le' });
  }
};

module.exports = { authMiddleware };
