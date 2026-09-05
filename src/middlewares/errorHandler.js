// Global error handler
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('[Unhandled Error]', {
    message : err.message,
    stack   : process.env.NODE_ENV === 'production' ? '(hidden)' : err.stack,
    path    : req.path,
    method  : req.method,
  });

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: 'Du lieu khong hop le', errors: messages });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Gia tri truong '${err.path}' khong hop le` });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({ message: `Gia tri '${field}' da ton tai` });
  }

  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({ message: 'Request body khong phai JSON hop le' });
  }

  return res.status(500).json({
    message: 'Loi server noi bo',
    ...(process.env.NODE_ENV !== 'production' && { detail: err.message }),
  });
};

module.exports = errorHandler;
