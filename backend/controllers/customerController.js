// backend/controllers/customerController.js
const { Customer, Vehicle } = require('../models');
const { asyncHandler } = require('../utils/errorHandler');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// Get customer by phone number
exports.getCustomerByPhone = asyncHandler(async (req, res) => {
  const { phoneNumber } = req.params;
  
  const customer = await Customer.findOne({ phoneNumber });
  
  if (!customer) {
    return sendError(res, 404, 'Customer not found');
  }
  
  // Get customer's vehicles
  const vehicles = await Vehicle.find({ customerId: customer._id });
  
  sendSuccess(res, 200, { customer, vehicles });
});

// Create or update customer
exports.createOrUpdateCustomer = asyncHandler(async (req, res) => {
  const { phoneNumber, name, email, address } = req.body;
  
  let customer = await Customer.findOne({ phoneNumber });
  
  if (customer) {
    // Update existing customer
    customer.name = name || customer.name;
    customer.email = email || customer.email;
    customer.address = address || customer.address;
    await customer.save();
    
    return sendSuccess(res, 200, customer, 'Customer updated successfully');
  }
  
  // Create new customer
  customer = await Customer.create({ phoneNumber, name, email, address });
  sendSuccess(res, 201, customer, 'Customer created successfully');
});

// Get all customers
exports.getAllCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find().sort({ createdAt: -1 });
  sendSuccess(res, 200, customers);
});

// Search customers
exports.searchCustomers = asyncHandler(async (req, res) => {
  const { query } = req.query;
  
  const customers = await Customer.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { phoneNumber: { $regex: query, $options: 'i' } }
    ]
  }).limit(10);
  
  sendSuccess(res, 200, customers);
});
