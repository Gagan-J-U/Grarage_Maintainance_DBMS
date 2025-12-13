// backend/middleware/validation.js
// Request validation middleware

const { sendError } = require('../utils/responseHandler');

/**
 * Validate phone number format
 */
function validatePhone(phone) {
  if (!phone) return false;
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate email format
 */
function validateEmail(email) {
  if (!email) return true; // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate customer data
 */
function validateCustomer(req, res, next) {
  const { phone, name } = req.body;
  
  if (!phone || !name) {
    return sendError(res, 400, 'Phone and name are required');
  }
  
  if (!validatePhone(phone)) {
    return sendError(res, 400, 'Invalid phone number format. Must be 10 digits');
  }
  
  if (req.body.email && !validateEmail(req.body.email)) {
    return sendError(res, 400, 'Invalid email format');
  }
  
  next();
}

/**
 * Validate vehicle data
 */
function validateVehicle(req, res, next) {
  const { vehicleNumber, customerId, vehicleType } = req.body;
  
  if (!vehicleNumber || !customerId || !vehicleType) {
    return sendError(res, 400, 'Vehicle number, customer ID, and vehicle type are required');
  }
  
  if (!['2-wheeler', '3-wheeler', '4-wheeler'].includes(vehicleType)) {
    return sendError(res, 400, 'Invalid vehicle type');
  }
  
  next();
}

/**
 * Validate service data
 */
function validateService(req, res, next) {
  const { customerId, vehicleId } = req.body;
  
  if (!customerId || !vehicleId) {
    return sendError(res, 400, 'Customer ID and Vehicle ID are required');
  }
  
  next();
}

/**
 * Validate payment data
 */
function validatePayment(req, res, next) {
  const { paymentId, paymentMode, paidAmount } = req.body;
  
  if (!paymentId || !paymentMode || paidAmount === undefined) {
    return sendError(res, 400, 'Payment ID, payment mode, and paid amount are required');
  }
  
  if (!['Cash', 'UPI', 'Card', 'Net Banking'].includes(paymentMode)) {
    return sendError(res, 400, 'Invalid payment mode');
  }
  
  if (paidAmount < 0) {
    return sendError(res, 400, 'Paid amount cannot be negative');
  }
  
  next();
}

/**
 * Validate feedback data
 */
function validateFeedback(req, res, next) {
  const { serviceId, customerId, rating } = req.body;
  
  if (!serviceId || !customerId || !rating) {
    return sendError(res, 400, 'Service ID, customer ID, and rating are required');
  }
  
  if (rating < 1 || rating > 5) {
    return sendError(res, 400, 'Rating must be between 1 and 5');
  }
  
  next();
}

module.exports = {
  validatePhone,
  validateEmail,
  validateCustomer,
  validateVehicle,
  validateService,
  validatePayment,
  validateFeedback
};

