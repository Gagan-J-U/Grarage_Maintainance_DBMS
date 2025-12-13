// backend/routes/vehicleRoutes.js
const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// Get vehicle by number
router.get('/number/:vehicleNumber', vehicleController.getVehicleByNumber);

// Create or update vehicle
router.post('/', vehicleController.createOrUpdateVehicle);

// Get vehicles by customer
router.get('/customer/:customerId', vehicleController.getVehiclesByCustomer);

module.exports = router;

