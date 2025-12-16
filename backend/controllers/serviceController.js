// backend/controllers/serviceController.js
const { Service, ServiceHistory, Payment, PartsInventory } = require('../models');
const mongoose = require('mongoose');
const { asyncHandler } = require('../utils/errorHandler');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { deductParts, restoreParts } = require('../services/inventoryService');
const { completeService } = require('../services/serviceTransactionService');

// Create new service
exports.createService = asyncHandler(async (req, res) => {
  const { customerId, vehicleId, servicesRequested, description, laborCharges, estimatedCompletionDate, serviceDate } = req.body;
  
  const service = await Service.create({
    customerId,
    vehicleId,
    servicesRequested: servicesRequested || [],
    description,
    laborCharges: laborCharges || 0,
    estimatedCompletionDate,
    serviceDate: serviceDate || new Date(),
    totalAmount: laborCharges || 0
  });
  
  await service.populate(['customerId', 'vehicleId']);
  
  sendSuccess(res, 201, service, 'Service created successfully');
});

// Get service by ID
exports.getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id)
    .populate('customerId')
    .populate('vehicleId')
    .populate('assignedEmployees')
    .populate('partsUsed.partId');
  
  if (!service) {
    return sendError(res, 404, 'Service not found');
  }
  
  sendSuccess(res, 200, service);
});

// Get all services with filters
exports.getAllServices = asyncHandler(async (req, res) => {
  const { status, startDate, endDate, customerId, vehicleId } = req.query;
  
  let filter = {};
  
  if (status) filter.status = status;
  if (customerId) filter.customerId = customerId;
  if (vehicleId) filter.vehicleId = vehicleId;
  
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  
  const services = await Service.find(filter)
    .populate('customerId')
    .populate('vehicleId')
    .populate('assignedEmployees')
    .sort({ createdAt: -1 });
  
  sendSuccess(res, 200, services);
});

// Add parts to service
exports.addPartsToService = asyncHandler(async (req, res) => {
  const { serviceId, parts } = req.body; // parts: [{ partId, quantity }]
  
  // Check if MongoDB supports transactions
  const hasReplicaSet = mongoose.connection.readyState === 1 && 
                        mongoose.connection.db && 
                        mongoose.connection.db.serverConfig &&
                        mongoose.connection.db.serverConfig.isReplicaSet;
  
  if (hasReplicaSet) {
    // Use transaction for replica set
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const service = await Service.findById(serviceId).session(session);
      if (!service) throw new Error('Service not found');
      
      // Use inventory service to deduct parts atomically
      const { partsUsed, totalCost } = await deductParts(parts, session);
      
      // Add parts to service
      service.partsUsed.push(...partsUsed);
      
      // Update total amount
      service.totalAmount += totalCost;
      await service.save({ session });
      
      await session.commitTransaction();
      
      await service.populate(['customerId', 'vehicleId', 'partsUsed.partId']);
      
      sendSuccess(res, 200, service, 'Parts added successfully');
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } else {
    // Execute without transaction for standalone MongoDB
    try {
      const service = await Service.findById(serviceId);
      if (!service) throw new Error('Service not found');
      
      // Use inventory service to deduct parts
      const { partsUsed, totalCost } = await deductParts(parts);
      
      // Add parts to service
      service.partsUsed.push(...partsUsed);
      
      // Update total amount
      service.totalAmount += totalCost;
      await service.save();
      
      await service.populate(['customerId', 'vehicleId', 'partsUsed.partId']);
      
      sendSuccess(res, 200, service, 'Parts added successfully');
    } catch (error) {
      throw error;
    }
  }
});

// Remove part from service
exports.removePartFromService = asyncHandler(async (req, res) => {
  const { serviceId, partIndex } = req.body;
  
  // Check if MongoDB supports transactions
  const hasReplicaSet = mongoose.connection.readyState === 1 && 
                        mongoose.connection.db && 
                        mongoose.connection.db.serverConfig &&
                        mongoose.connection.db.serverConfig.isReplicaSet;
  
  if (hasReplicaSet) {
    // Use transaction for replica set
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const service = await Service.findById(serviceId).session(session);
      if (!service) throw new Error('Service not found');
      
      const partToRemove = service.partsUsed[partIndex];
      if (!partToRemove) throw new Error('Part not found in service');
      
      // Restore inventory using service
      await restoreParts([partToRemove], session);
      
      // Update service total
      service.totalAmount -= partToRemove.totalPrice;
      
      // Remove part
      service.partsUsed.splice(partIndex, 1);
      await service.save({ session });
      
      await session.commitTransaction();
      
      sendSuccess(res, 200, service, 'Part removed successfully');
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } else {
    // Execute without transaction for standalone MongoDB
    try {
      const service = await Service.findById(serviceId);
      if (!service) throw new Error('Service not found');
      
      const partToRemove = service.partsUsed[partIndex];
      if (!partToRemove) throw new Error('Part not found in service');
      
      // Restore inventory using service
      await restoreParts([partToRemove]);
      
      // Update service total
      service.totalAmount -= partToRemove.totalPrice;
      
      // Remove part
      service.partsUsed.splice(partIndex, 1);
      await service.save();
      
      sendSuccess(res, 200, service, 'Part removed successfully');
    } catch (error) {
      throw error;
    }
  }
});

// Update service status
exports.updateServiceStatus = asyncHandler(async (req, res) => {
  const { serviceId, status } = req.body;
  
  const service = await Service.findById(serviceId);
  if (!service) {
    return sendError(res, 404, 'Service not found');
  }
  
  service.status = status;
  
  if (status === 'Completed') {
    // Use transaction service to complete service atomically
    await completeService(serviceId);
    await service.populate(['customerId', 'vehicleId']);
    return sendSuccess(res, 200, service, 'Service completed successfully');
  }
  
  await service.save();
  await service.populate(['customerId', 'vehicleId']);
  
  sendSuccess(res, 200, service, 'Service status updated');
});

// Update service
exports.updateService = asyncHandler(async (req, res) => {
  const { id } = req.params; // Route parameter is 'id', not 'serviceId'
  const updates = req.body;
  
  // Calculate totalAmount if partsUsed or laborCharges are being updated
  if (updates.laborCharges !== undefined || updates.partsUsed !== undefined) {
    const service = await Service.findById(id);
    if (!service) {
      return sendError(res, 404, 'Service not found');
    }
    
    // Calculate parts total
    const partsUsed = updates.partsUsed || service.partsUsed || [];
    const partsTotal = partsUsed.reduce((sum, part) => sum + (part.totalPrice || 0), 0);
    
    // Calculate total
    const laborCharges = updates.laborCharges !== undefined ? updates.laborCharges : service.laborCharges;
    updates.totalAmount = partsTotal + (laborCharges || 0);
  }
  
  const service = await Service.findByIdAndUpdate(
    id,
    updates,
    { new: true, runValidators: true }
  ).populate(['customerId', 'vehicleId', 'assignedEmployees', 'partsUsed.partId']);
  
  if (!service) {
    return sendError(res, 404, 'Service not found');
  }
  
  sendSuccess(res, 200, service, 'Service updated successfully');
});
