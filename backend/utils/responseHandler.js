// backend/utils/responseHandler.js
const sendSuccess = (res, statusCode = 200, data = null, message = 'Success', meta = null) => {
  const payload = { success: true, message, data };
  if (meta) payload.meta = meta;
  res.status(statusCode).json(payload);
};

const sendError = (res, statusCode = 500, message = 'Server Error', error = null) => {
  const payload = { success: false, error: message };
  if (error && process.env.NODE_ENV !== 'production') payload.details = error;
  res.status(statusCode).json(payload);
};

module.exports = { sendSuccess, sendError };
