/**
 * Middleware to handle routes that are not found (404)
 */
const notFound = (req, res, next) => {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global error-handling middleware
 * Catches all forwarded errors and formats them into a standardized JSON response
 */
const errorHandler = (err, req, res, next) => {
  // Deliberate HTTP 403 response for unauthorized cross-origin requests
  if (err.isCors || (err.message && err.message.startsWith('CORS policy:'))) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Cross-origin request not authorized by security policy.'
    });
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = { notFound, errorHandler };
