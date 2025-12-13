// backend/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Get dashboard stats
router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;

