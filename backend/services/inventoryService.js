// backend/services/inventoryService.js
// Handles atomic inventory transactions

const { PartsInventory } = require('../models');
const mongoose = require('mongoose');

/**
 * Deduct parts from inventory atomically
 * @param {Array} parts - Array of { partId, quantity }
 * @param {Object} session - MongoDB session for transaction
 * @returns {Object} - { partsUsed, totalCost }
 */
async function deductParts(parts, session = null) {
  const partsUsed = [];
  let totalCost = 0;
  
  for (const part of parts) {
    const partDoc = await PartsInventory.findById(part.partId).session(session);
    
    if (!partDoc) {
      throw new Error(`Part not found: ${part.partId}`);
    }
    
    if (partDoc.quantityAvailable < part.quantity) {
      throw new Error(`Insufficient stock for ${partDoc.partName}. Available: ${partDoc.quantityAvailable}, Requested: ${part.quantity}`);
    }
    
    // Deduct from inventory
    partDoc.quantityAvailable -= part.quantity;
    await partDoc.save({ session });
    
    const totalPrice = partDoc.price * part.quantity;
    totalCost += totalPrice;
    
    partsUsed.push({
      partId: partDoc._id,
      partName: partDoc.partName,
      quantity: part.quantity,
      pricePerUnit: partDoc.price,
      totalPrice
    });
  }
  
  return { partsUsed, totalCost };
}

/**
 * Restore parts to inventory atomically
 * @param {Array} partsUsed - Array of parts to restore
 * @param {Object} session - MongoDB session for transaction
 */
async function restoreParts(partsUsed, session = null) {
  for (const part of partsUsed) {
    if (part.partId) {
      const partDoc = await PartsInventory.findById(part.partId).session(session);
      if (partDoc) {
        partDoc.quantityAvailable += part.quantity;
        await partDoc.save({ session });
      }
    }
  }
}

/**
 * Update inventory with transaction support
 * @param {String} partId - Part ID
 * @param {Number} quantity - Quantity to add/subtract
 * @param {String} operation - 'add' or 'subtract'
 * @param {Object} session - MongoDB session
 */
async function updateInventory(partId, quantity, operation, session = null) {
  const part = await PartsInventory.findById(partId).session(session);
  
  if (!part) {
    throw new Error('Part not found');
  }
  
  if (operation === 'add') {
    part.quantityAvailable += quantity;
  } else if (operation === 'subtract') {
    if (part.quantityAvailable < quantity) {
      throw new Error('Insufficient quantity available');
    }
    part.quantityAvailable -= quantity;
  } else {
    throw new Error('Invalid operation. Use "add" or "subtract"');
  }
  
  await part.save({ session });
  return part;
}

module.exports = {
  deductParts,
  restoreParts,
  updateInventory
};

