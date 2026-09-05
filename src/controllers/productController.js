const PRODUCTS = [
  { id: 1, name: 'Laptop Dell XPS 15',       status: 'available'     },
  { id: 2, name: 'iPhone 15 Pro Max',         status: 'available'     },
  { id: 3, name: 'Samsung Galaxy S23',        status: 'out_of_stock'  },
  { id: 4, name: 'Sony WH-1000XM5 Headphone',status: 'discontinued'  },
  { id: 5, name: 'iPad Pro 12.9"',            status: 'out_of_stock'  },
];

const VALID_STATUSES = ['available', 'out_of_stock', 'discontinued'];

const getMe = (req, res) => {
  const { userId, email } = req.user;

  return res.status(200).json({
    id: userId,
    email,
  });
};

const getProducts = (req, res) => {
  const { status } = req.query;

  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Status khong hop le. Chi chap nhan: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const filtered = PRODUCTS.filter((p) => p.status === status);
    return res.status(200).json({ products: filtered, total: filtered.length });
  }

  return res.status(200).json({ products: PRODUCTS, total: PRODUCTS.length });
};

module.exports = { getMe, getProducts };
