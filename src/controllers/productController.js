// ────────────────────────────────────────────────────────────
//  Mock Data (Hardcoded) thay cho Database thật
// ────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id: 1, name: 'Laptop Dell XPS 15',       status: 'available'     },
  { id: 2, name: 'iPhone 15 Pro Max',         status: 'available'     },
  { id: 3, name: 'Samsung Galaxy S23',        status: 'out_of_stock'  },
  { id: 4, name: 'Sony WH-1000XM5 Headphone',status: 'discontinued'  },
  { id: 5, name: 'iPad Pro 12.9"',            status: 'out_of_stock'  },
];

// Danh sách các trạng thái hợp lệ để chặn lỗi Validation ngay từ vòng gửi xe
const VALID_STATUSES = ['available', 'out_of_stock', 'discontinued'];

/**
 * GET /api/me
 * Trả về thông tin cá nhân của User hiện tại.
 * Dữ liệu `req.user` đã được middleware `authMiddleware` giải mã từ JWT Token và gắn vào req.
 */
const getMe = (req, res) => {
  const { userId, email } = req.user;

  return res.status(200).json({
    id: userId,
    email,
  });
};

/**
 * GET /api/products
 * Trả về danh sách sản phẩm. Hỗ trợ lọc theo query param `status`.
 */
const getProducts = (req, res) => {
  // Lấy giá trị query parameter `status` (ví dụ: ?status=available)
  const { status } = req.query;

  // Nếu người dùng có truyền param `status`
  if (status !== undefined) {
    // 1. Validation: Kiểm tra xem status có hợp lệ không
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Status khong hop le. Chi chap nhan: ${VALID_STATUSES.join(', ')}`,
      });
    }

    // 2. Lọc mảng sản phẩm theo đúng status yêu cầu
    const filtered = PRODUCTS.filter((p) => p.status === status);
    return res.status(200).json({ products: filtered, total: filtered.length });
  }

  // Nếu không truyền status, trả về toàn bộ dữ liệu
  return res.status(200).json({ products: PRODUCTS, total: PRODUCTS.length });
};

module.exports = { getMe, getProducts };
