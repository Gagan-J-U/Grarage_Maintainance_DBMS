const { Feedback } = require('../models');
const { asyncHandler } = require('../utils/errorHandler');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// Create feedback
exports.createFeedback = asyncHandler(async (req, res) => {
  const { serviceId, customerId, rating, comments } = req.body;
  
  // Check if feedback already exists for this service
  const existingFeedback = await Feedback.findOne({ serviceId });
  
  if (existingFeedback) {
    return sendError(res, 400, 'Feedback already submitted for this service');
  }
  
  const feedback = await Feedback.create({
    serviceId,
    customerId,
    rating,
    comment: comments
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
