// backend/routes/historyRoutes.js
const express = require('express');
const router = express.Router();
const { ServiceHistory, Service, Customer, Vehicle } = require('../models');
const { asyncHandler } = require('../utils/errorHandler');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// Get all service history with filters
router.get('/', asyncHandler(async (req, res) => {
  const { startDate, endDate, phone, vehicleNumber } = req.query;
  
  let filter = {};
  
  // Date filter
  if (startDate || endDate) {
    filter.completionDate = {};
    if (startDate) filter.completionDate.$gte = new Date(startDate);
    if (endDate) filter.completionDate.$lte = new Date(endDate);
  }
  
  let history = await ServiceHistory.find(filter)
    .populate('customerId')
    .populate('vehicleId')
    .sort({ completionDate: -1 });
  
  // Filter by phone if provided
  if (phone) {
    const customers = await Customer.find({ phone: { $regex: phone, $options: 'i' } });
    const customerIds = customers.map(c => c._id);
    history = history.filter(h => customerIds.includes(h.customerId._id));
  }
  
  // Filter by vehicle number if provided
  if (vehicleNumber) {
    const vehicles = await Vehicle.find({ vehicleNumber: { $regex: vehicleNumber.toUpperCase(), $options: 'i' } });
    const vehicleIds = vehicles.map(v => v._id);
    history = history.filter(h => vehicleIds.includes(h.vehicleId._id));
  }
  
  sendSuccess(res, 200, history);
}));

// Get history by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const history = await ServiceHistory.findById(req.params.id)
    .populate('customerId')
    .populate('vehicleId');
  
  if (!history) {
    return sendError(res, 404, 'Service history not found');
  }
  
  sendSuccess(res, 200, history);
}));

module.exports = router;

