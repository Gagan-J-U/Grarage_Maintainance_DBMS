const mongoose = require('mongoose');

const partsInventorySchema = new mongoose.Schema({
  partName: {
    type: String,
    required: true,
    trim: true
  },
  partNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  category: {
    type: String,
    enum: ['Engine', 'Electrical', 'Body', 'Suspension', 'Brake', 'Transmission', 'Other'],
    required: true
  },
  quantityAvailable: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  reorderLevel: {
    type: Number,
    default: 5 // Alert when stock falls below this
  },
  supplier: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for low stock queries
partsInventorySchema.index({ quantityAvailable: 1 });

module.exports = mongoose.model('PartsInventory', partsInventorySchema);
