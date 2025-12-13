const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
    index: true
  },
  servicesRequested: [{
    type: String,
    enum: ['Oil Change', 'Engine Repair', 'Brake Service', 'Tire Change', 
           'Battery Replacement', 'AC Service', 'Washing', 'Painting', 
           'General Checkup', 'Electrical Work', 'Other']
  }],
  description: {
    type: String,
    trim: true
  },
  partsUsed: [{
    partId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PartsInventory'
    },
    partName: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    pricePerUnit: Number,
    totalPrice: Number
  }],
  laborCharges: {
    type: Number,
    default: 0,
    min: 0
  },
  extraCharges: [{
    description: String,
    amount: Number
  }],
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  assignedEmployees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending',
    index: true
  },
  serviceDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  completionDate: {
    type: Date
  },
  estimatedCompletionDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound indexes for common queries
serviceSchema.index({ status: 1, createdAt: -1 });
serviceSchema.index({ customerId: 1, createdAt: -1 });
serviceSchema.index({ vehicleId: 1, createdAt: -1 });

module.exports = mongoose.model('Service', serviceSchema);
