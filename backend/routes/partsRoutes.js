// backend/routes/partsRoutes.js
const express = require('express');
const router = express.Router();
const partsController = require('../controllers/partsController');

// Get all parts
router.get('/', partsController.getAllParts);

// Search parts
router.get('/search', partsController.searchParts);

// Get part by ID
router.get('/:id', partsController.getPartById);

// Create part
router.post('/', partsController.createPart);

// Update part
router.put('/:id', partsController.updatePart);

// Update part quantity
router.post('/update-quantity', partsController.updatePartQuantity);

// Delete part
router.delete('/:id', partsController.deletePart);

module.exports = router;

