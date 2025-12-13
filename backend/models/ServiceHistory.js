const mongoose = require('mongoose');

const serviceHistorySchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
    index: true
  },
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
  serviceSnapshot: {
    type: mongoose.Schema.Types.Mixed // Store complete service data
  },
  completionDate: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for date range queries
serviceHistorySchema.index({ completionDate: -1 });

module.exports = mongoose.model('ServiceHistory', serviceHistorySchema);
