// backend/routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Get customer by phone
router.get('/phone/:phone', customerController.getCustomerByPhone);

// Create or update customer
router.post('/', customerController.createOrUpdateCustomer);

// Get all customers
router.get('/', customerController.getAllCustomers);

// Search customers
router.get('/search', customerController.searchCustomers);

module.exports = router;
