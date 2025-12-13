const { Customer, Vehicle, Service, Payment, Employee, PartsInventory } = require('../models');
const { asyncHandler } = require('../utils/errorHandler');
const { sendSuccess } = require('../utils/responseHandler');

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  let dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }
  
  // Get counts
  const totalCustomers = await Customer.countDocuments();
  const totalVehicles = await Vehicle.countDocuments();
  const activeEmployees = await Employee.countDocuments({ status: 'Active' });
  
  // Service statistics
  const pendingServices = await Service.countDocuments({ status: 'Pending' });
  const inProgressServices = await Service.countDocuments({ status: 'In Progress' });
  const completedServices = await Service.countDocuments({ 
    status: 'Completed',
    ...dateFilter
  });
  
  // Payment statistics
  const totalRevenue = await Payment.aggregate([
    { 
      $match: { 
        paymentStatus: 'Paid',
        ...dateFilter
      } 
    },
    { 
      $group: { 
        _id: null, 
        total: { $sum: '$totalAmount' } 
      } 
    }
  ]);
  
  const pendingPayments = await Payment.aggregate([
    { 
      $match: { 
        paymentStatus: { $in: ['Pending', 'Partial'] } 
      } 
    },
    { 
      $group: { 
        _id: null, 
        total: { $sum: '$balanceAmount' } 
      } 
    }
  ]);
  
  // Low stock parts
  const lowStockParts = await PartsInventory.find({
    $expr: { $lte: ['$quantityAvailable', '$reorderLevel'] }
  }).countDocuments();
  
  // Recent services
  const recentServices = await Service.find()
    .populate('customerId')
    .populate('vehicleId')
    .sort({ createdAt: -1 })
    .limit(5);
  
  const stats = {
    customers: totalCustomers,
    vehicles: totalVehicles,
    employees: activeEmployees,
    services: {
      pending: pendingServices,
      inProgress: inProgressServices,
      completed: completedServices
    },
    revenue: {
      total: totalRevenue[0]?.total || 0,
      pending: pendingPayments[0]?.total || 0
    },
    lowStockParts,
    recentServices
  };
  
  sendSuccess(res, 200, stats);
});
