/**
 * Global error-handling middleware.
 * Catches any error thrown / passed via next(error) and sends a
 * consistent JSON response.
 */
const errorMiddleware = (err, _req, res, _next) => {
  console.error(err.stack || err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join('. ') });
  }

  // Mongoose duplicate key (e.g. unique email)
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Email is already registered' });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal server error',
  });
};

export default errorMiddleware;
