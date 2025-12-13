// backend/routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Create feedback
router.post('/', feedbackController.createFeedback);

// Get all feedback
router.get('/', feedbackController.getAllFeedback);

// Get feedback by service
router.get('/service/:serviceId', feedbackController.getFeedbackByService);

module.exports = router;

