const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true // Index for fast lookups
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  vehicleType: {
    type: String,
    enum: ['2-wheeler', '3-wheeler', '4-wheeler'],
    required: true
  },
  brand: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  year: {
    type: Number
  },
  color: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index for customer's vehicles
vehicleSchema.index({ customerId: 1, vehicleNumber: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true // Index for fast lookups
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  vehicleType: {
    type: String,
    enum: ['2-wheeler', '3-wheeler', '4-wheeler'],
    required: true
  },
  brand: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  year: {
    type: Number
  },
  color: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index for customer's vehicles
vehicleSchema.index({ customerId: 1, vehicleNumber: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);