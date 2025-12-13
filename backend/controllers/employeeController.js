const { Employee } = require('../models');
const { asyncHandler } = require('../utils/errorHandler');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// Get all employees
exports.getAllEmployees = asyncHandler(async (req, res) => {
  const { status } = req.query;
  
  const filter = status ? { status } : {};
  const employees = await Employee.find(filter).sort({ createdAt: -1 });
  
  sendSuccess(res, 200, employees);
});

// Get employee by ID
exports.getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  
  if (!employee) {
    return sendError(res, 404, 'Employee not found');
  }
  
  sendSuccess(res, 200, employee);
});

// Create employee
exports.createEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.create(req.body);
  sendSuccess(res, 201, employee, 'Employee created successfully');
});

// Update employee
exports.updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!employee) {
    return sendError(res, 404, 'Employee not found');
  }
  
  sendSuccess(res, 200, employee, 'Employee updated successfully');
});

// Delete employee (soft delete by setting status to Inactive)
exports.deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    { status: 'Inactive' },
    { new: true }
  );
  
  if (!employee) {
    return sendError(res, 404, 'Employee not found');
  }
  
  sendSuccess(res, 200, employee, 'Employee deleted successfully');
});
