const { Payment, Service } = require('../models');
const { asyncHandler } = require('../utils/errorHandler');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// Get all payments
exports.getAllPayments = asyncHandler(async (req, res) => {
  const { status, startDate, endDate } = req.query;
  
  let filter = {};
  if (status) filter.paymentStatus = status;
  
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  
  const payments = await Payment.find(filter)
    .populate('customerId')
    .populate('vehicleId')
    .populate('serviceId')
    .sort({ createdAt: -1 });
  
  sendSuccess(res, 200, payments);
});

// Get payment by service ID
exports.getPaymentByService = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ serviceId: req.params.serviceId })
    .populate('customerId')
    .populate('vehicleId')
    .populate('serviceId');
  
  if (!payment) {
    return sendError(res, 404, 'Payment not found');
  }
  
  sendSuccess(res, 200, payment);
});

// Get payment by ID
exports.getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('customerId')
    .populate('vehicleId')
    .populate('serviceId');
  
  if (!payment) {
    return sendError(res, 404, 'Payment not found');
  }
  
  sendSuccess(res, 200, payment);
});

// Process payment
exports.processPayment = asyncHandler(async (req, res) => {
  const { 
    paymentId, 
    paymentMode, 
    paidAmount, 
    transactionId,
    taxPercentage 
  } = req.body;
  
  const payment = await Payment.findById(paymentId);
  
  if (!payment) {
    return sendError(res, 404, 'Payment not found');
  }
  
  // Calculate tax if provided
  if (taxPercentage) {
    payment.taxPercentage = taxPercentage;
    payment.taxAmount = (payment.subtotal * taxPercentage) / 100;
    payment.totalAmount = payment.subtotal + payment.taxAmount;
  }
  
  payment.paymentMode = paymentMode;
  payment.paidAmount = paidAmount;
  payment.transactionId = transactionId;
  payment.paymentDate = new Date();
  
  // Check if fully paid
  if (paidAmount >= payment.totalAmount) {
    payment.paymentStatus = 'Paid';
    payment.balanceAmount = 0;
  } else {
    payment.paymentStatus = 'Partial';
    payment.balanceAmount = payment.totalAmount - paidAmount;
  }
  
  await payment.save();
  await payment.populate(['customerId', 'vehicleId', 'serviceId']);
  
  sendSuccess(res, 200, payment, 'Payment processed successfully');
});

// Update payment
exports.updatePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate(['customerId', 'vehicleId', 'serviceId']);
  
  if (!payment) {
    return sendError(res, 404, 'Payment not found');
  }
  
  sendSuccess(res, 200, payment, 'Payment updated successfully');
});
