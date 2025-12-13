// backend/utils/errorHandler.js
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message || 'Something went wrong';

  console.error('Error Handled:', {
    message: error.message,
    name: err.name,
    stack: err.stack,
    code: err.code,
    keyValue: err.keyValue
  });

  if (err.name === 'CastError') {
    error = new AppError('Resource not found', 404);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).join(', ');
    error = new AppError(`${field || 'Duplicate field'} already exists`, 400);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(e => e.message).join(', ');
    error = new AppError(message, 400);
  }

  const statusCode = error.statusCode || 500;
  const response = { success: false, error: error.message || 'Server Error' };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = { AppError, asyncHandler, errorHandler };