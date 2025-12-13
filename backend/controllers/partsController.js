const { PartsInventory } = require('../models');
const { asyncHandler } = require('../utils/errorHandler');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// Get all parts
exports.getAllParts = asyncHandler(async (req, res) => {
  const { category, lowStock } = req.query;
  
  let filter = {};
  if (category) filter.category = category;
  
  if (lowStock === 'true') {
    // Find parts where quantity is below reorder level
    const parts = await PartsInventory.find().sort({ quantityAvailable: 1 });
    const lowStockParts = parts.filter(p => p.quantityAvailable <= p.reorderLevel);
    return sendSuccess(res, 200, lowStockParts);
  }
  
  const parts = await PartsInventory.find(filter).sort({ partName: 1 });
  sendSuccess(res, 200, parts);
});

// Get part by ID
exports.getPartById = asyncHandler(async (req, res) => {
  const part = await PartsInventory.findById(req.params.id);
  
  if (!part) {
    return sendError(res, 404, 'Part not found');
  }
  
  sendSuccess(res, 200, part);
});

// Search parts
exports.searchParts = asyncHandler(async (req, res) => {
  const { query } = req.query;
  
  const parts = await PartsInventory.find({
    $or: [
      { partName: { $regex: query, $options: 'i' } },
      { partNumber: { $regex: query, $options: 'i' } }
    ]
  }).limit(20);
  
  sendSuccess(res, 200, parts);
});

// Create part
exports.createPart = asyncHandler(async (req, res) => {
  const part = await PartsInventory.create(req.body);
  sendSuccess(res, 201, part, 'Part created successfully');
});

// Update part
exports.updatePart = asyncHandler(async (req, res) => {
  const part = await PartsInventory.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!part) {
    return sendError(res, 404, 'Part not found');
  }
  
  sendSuccess(res, 200, part, 'Part updated successfully');
});

// Update part quantity (for restocking)
exports.updatePartQuantity = asyncHandler(async (req, res) => {
  const { partId, quantity, operation } = req.body; // operation: 'add' or 'subtract'
  
  const part = await PartsInventory.findById(partId);
  
  if (!part) {
    return sendError(res, 404, 'Part not found');
  }
  
  if (operation === 'add') {
    part.quantityAvailable += quantity;
  } else if (operation === 'subtract') {
    if (part.quantityAvailable < quantity) {
      return sendError(res, 400, 'Insufficient quantity available');
    }
    part.quantityAvailable -= quantity;
  }
  
  await part.save();
  sendSuccess(res, 200, part, 'Quantity updated successfully');
});

// Delete part
exports.deletePart = asyncHandler(async (req, res) => {
  const part = await PartsInventory.findByIdAndDelete(req.params.id);
  
  if (!part) {
    return sendError(res, 404, 'Part not found');
  }
  
  sendSuccess(res, 200, null, 'Part deleted successfully');
});
