// backend/routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// Create service
router.post('/', serviceController.createService);

// Get all services
router.get('/', serviceController.getAllServices);

// Get service by ID
router.get('/:id', serviceController.getServiceById);

// Update service
router.put('/:id', serviceController.updateService);

// Add parts to service
router.post('/add-parts', serviceController.addPartsToService);

// Remove part from service
router.post('/remove-part', serviceController.removePartFromService);

// Update service status
router.post('/update-status', serviceController.updateServiceStatus);

module.exports = router;

