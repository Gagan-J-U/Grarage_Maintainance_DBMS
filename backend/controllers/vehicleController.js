// backend/controllers/vehicleController.js
const { Vehicle } = require('../models');
const { asyncHandler } = require('../utils/errorHandler');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// Get vehicle by number
exports.getVehicleByNumber = asyncHandler(async (req, res) => {
  const { vehicleNumber } = req.params;
  
  const vehicle = await Vehicle.findOne({ 
    vehicleNumber: vehicleNumber.toUpperCase() 
  }).populate('customerId');
  
  if (!vehicle) {
    return sendError(res, 404, 'Vehicle not found');
  }
  
  sendSuccess(res, 200, vehicle);
});

// Create or update vehicle
exports.createOrUpdateVehicle = asyncHandler(async (req, res) => {
  const { vehicleNumber, customerId, vehicleType, brand, model, year, color } = req.body;
  
  const upperVehicleNumber = vehicleNumber.toUpperCase();
  
  let vehicle = await Vehicle.findOne({ vehicleNumber: upperVehicleNumber });
  
  if (vehicle) {
    // Update existing vehicle
    vehicle.vehicleType = vehicleType || vehicle.vehicleType;
    vehicle.brand = brand || vehicle.brand;
    vehicle.model = model || vehicle.model;
    vehicle.year = year || vehicle.year;
    vehicle.color = color || vehicle.color;
    await vehicle.save();
    
    return sendSuccess(res, 200, vehicle, 'Vehicle updated successfully');
  }
  
  // Create new vehicle
  vehicle = await Vehicle.create({
    vehicleNumber: upperVehicleNumber,
    customerId,
    vehicleType,
    brand,
    model,
    year,
    color
  });
  
  sendSuccess(res, 201, vehicle, 'Vehicle created successfully');
});

// Get vehicles by customer
exports.getVehiclesByCustomer = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  
  const vehicles = await Vehicle.find({ customerId });
  sendSuccess(res, 200, vehicles);
});
