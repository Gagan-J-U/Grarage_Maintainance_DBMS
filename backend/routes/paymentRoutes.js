// backend/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Get all payments
router.get('/', paymentController.getAllPayments);

// Get payment by service ID
router.get('/service/:serviceId', paymentController.getPaymentByService);

// Get payment by ID
router.get('/:id', paymentController.getPaymentById);

// Process payment
router.post('/process', paymentController.processPayment);

// Update payment
router.put('/:id', paymentController.updatePayment);

module.exports = router;

