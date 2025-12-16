const { Feedback } = require('../models');
const { asyncHandler } = require('../utils/errorHandler');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// Create feedback
exports.createFeedback = asyncHandler(async (req, res) => {
  const { serviceId, customerId, rating, comment } = req.body;
  
  // Validate required fields
  if (!serviceId || !customerId || !rating) {
    return sendError(res, 400, 'Service ID, Customer ID, and Rating are required');
  }
  
  // Ensure customerId and serviceId are strings (not objects)
  let customerIdStr = '';
  let serviceIdStr = '';
  
  // Handle customerId
  if (!customerId) {
    return sendError(res, 400, 'Customer ID is required');
  }
  
  if (typeof customerId === 'object' && customerId !== null) {
    customerIdStr = customerId._id ? customerId._id.toString() : String(customerId);
  } else if (typeof customerId === 'string') {
    customerIdStr = customerId.trim();
  } else {
    customerIdStr = String(customerId);
  }
  
  // Check if it's the problematic "[object Object]" string
  if (customerIdStr === '[object Object]' || customerIdStr.includes('[object Object]')) {
    return sendError(res, 400, 'Invalid Customer ID format. Please ensure customer ID is a valid string.');
  }
  
  // Handle serviceId
  if (!serviceId) {
    return sendError(res, 400, 'Service ID is required');
  }
  
  if (typeof serviceId === 'object' && serviceId !== null) {
    serviceIdStr = serviceId._id ? serviceId._id.toString() : String(serviceId);
  } else if (typeof serviceId === 'string') {
    serviceIdStr = serviceId.trim();
  } else {
    serviceIdStr = String(serviceId);
  }
  
  // Check if it's the problematic "[object Object]" string
  if (serviceIdStr === '[object Object]' || serviceIdStr.includes('[object Object]')) {
    return sendError(res, 400, 'Invalid Service ID format. Please ensure service ID is a valid string.');
  }
  
  // Validate ObjectId format (24 hex characters)
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(customerIdStr)) {
    return sendError(res, 400, 'Invalid Customer ID format. Must be a valid MongoDB ObjectId.');
  }
  if (!objectIdRegex.test(serviceIdStr)) {
    return sendError(res, 400, 'Invalid Service ID format. Must be a valid MongoDB ObjectId.');
  }
  
  // Check if feedback already exists for this service
  const existingFeedback = await Feedback.findOne({ serviceId: serviceIdStr });
  
  if (existingFeedback) {
    return sendError(res, 400, 'Feedback already submitted for this service');
  }
  
  const feedback = await Feedback.create({
    serviceId: serviceIdStr,
    customerId: customerIdStr,
    rating,
    comment: comment || ''
  });
  
  await feedback.populate(['serviceId', 'customerId']);
  
  sendSuccess(res, 201, feedback, 'Feedback submitted successfully');
});

// Get all feedback
exports.getAllFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find()
    .populate('customerId')
    .populate('serviceId')
    .sort({ createdAt: -1 });
  
  sendSuccess(res, 200, feedback);
});

// Get feedback by service
exports.getFeedbackByService = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findOne({ serviceId: req.params.serviceId })
    .populate('customerId')
    .populate('serviceId');
  
  if (!feedback) {
    return sendError(res, 404, 'Feedback not found');
  }
  
  sendSuccess(res, 200, feedback);
});
