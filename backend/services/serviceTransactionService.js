// backend/services/serviceTransactionService.js
// Handles service-related transactions

const { Service, ServiceHistory, Payment } = require('../models');
const { deductParts, restoreParts } = require('./inventoryService');
const mongoose = require('mongoose');

/**
 * Complete a service and create history + payment entries
 * @param {String} serviceId - Service ID
 */
async function completeService(serviceId) {
  // Check if MongoDB supports transactions (replica set)
  // If not, execute without transactions
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
      
      if (!service) {
        throw new Error('Service not found');
      }
      
      if (service.status === 'Completed') {
        throw new Error('Service already completed');
      }
      
      // Update service status
      service.status = 'Completed';
      service.completionDate = new Date();
      await service.save({ session });
      
      // Create service history snapshot
      await ServiceHistory.create([{
        serviceId: service._id,
        customerId: service.customerId,
        vehicleId: service.vehicleId,
        serviceSnapshot: service.toObject(),
        completionDate: service.completionDate
      }], { session });
      
      // Calculate costs
      const partsCost = service.partsUsed.reduce((sum, part) => sum + (part.totalPrice || 0), 0);
      const extraCharges = (service.extraCharges || []).reduce((sum, extra) => sum + (extra.amount || 0), 0);
      
      // Create payment entry (paymentMode will be set when processing payment)
      await Payment.create([{
        serviceId: service._id,
        customerId: service.customerId,
        vehicleId: service.vehicleId,
        partsCost,
        laborCost: service.laborCharges,
        extraCharges,
        totalAmount: service.totalAmount,
        paymentStatus: 'Pending',
        balanceAmount: service.totalAmount // Initially, balance equals total
      }], { session });
      
      await session.commitTransaction();
      
      return service;
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
      
      if (!service) {
        throw new Error('Service not found');
      }
      
      if (service.status === 'Completed') {
        throw new Error('Service already completed');
      }
      
      // Update service status
      service.status = 'Completed';
      service.completionDate = new Date();
      await service.save();
      
      // Create service history snapshot
      await ServiceHistory.create({
        serviceId: service._id,
        customerId: service.customerId,
        vehicleId: service.vehicleId,
        serviceSnapshot: service.toObject(),
        completionDate: service.completionDate
      });
      
      // Calculate costs
      const partsCost = service.partsUsed.reduce((sum, part) => sum + (part.totalPrice || 0), 0);
      const extraCharges = (service.extraCharges || []).reduce((sum, extra) => sum + (extra.amount || 0), 0);
      
      // Create payment entry (paymentMode will be set when processing payment)
      await Payment.create({
        serviceId: service._id,
        customerId: service.customerId,
        vehicleId: service.vehicleId,
        partsCost,
        laborCost: service.laborCharges,
        extraCharges,
        totalAmount: service.totalAmount,
        paymentStatus: 'Pending',
        balanceAmount: service.totalAmount // Initially, balance equals total
      });
      
      return service;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = {
  completeService
};

