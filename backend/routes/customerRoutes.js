// backend/routes/customerRoutes.js
const express = require('express');
const { asyncHandler } = require('../utils/errorHandler');
const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'customer list (stub)' });
}));

module.exports = router;