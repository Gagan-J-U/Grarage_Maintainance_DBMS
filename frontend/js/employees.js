// frontend/js/employees.js

// Load employees on page load
document.addEventListener('DOMContentLoaded', () => {
  loadEmployees();
});

// Load employees with filters
async function loadEmployees() {
  showLoading('employeesTableBody');
  
  try {
    const status = document.getElementById('statusFilter').value;
    const response = await employeeAPI.getAll(status || undefined);
    const employees = response.data;
    displayEmployees(employees);
  } catch (error) {
    document.getElementById('employeesTableBody').innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-danger">Error loading employees: ${error.message}</td>
      </tr>
    `;
  }
}

// Display employees in table
function displayEmployees(employees) {
  const tbody = document.getElementById('employeesTableBody');
  
  if (!employees || employees.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted">No employees found</td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = employees.map(employee => {
    return `
      <tr>
        <td>${employee.name}</td>
        <td>${formatPhoneNumber(employee.phone)}</td>
        <td>${employee.role}</td>
        <td>${formatCurrency(employee.salary)}</td>
        <td><span class="badge ${getStatusBadgeClass(employee.status)}">${employee.status}</span></td>
        <td>${formatDate(employee.joiningDate)}</td>
        <td>
          <button onclick="openEditEmployeeModal('${employee._id}')" class="btn btn-sm btn-primary">Edit</button>
          <button onclick="deleteEmployee('${employee._id}')" class="btn btn-sm btn-danger">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Open add employee modal
function openAddEmployeeModal() {
  document.getElementById('employeeModalTitle').textContent = 'Add New Employee';
  document.getElementById('employeeForm').reset();
  document.getElementById('employeeId').value = '';
  document.getElementById('employeeJoiningDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('employeeStatus').value = 'Active';
  openModal('employeeModal');
}

// Open edit employee modal
async function openEditEmployeeModal(employeeId) {
  try {
    const response = await employeeAPI.getById(employeeId);
    const employee = response.data;
    
    document.getElementById('employeeModalTitle').textContent = 'Edit Employee';
    document.getElementById('employeeId').value = employee._id;
    document.getElementById('employeeName').value = employee.name;
    document.getElementById('employeePhone').value = employee.phone;
    document.getElementById('employeeRole').value = employee.role;
    document.getElementById('employeeSalary').value = employee.salary;
    document.getElementById('employeeStatus').value = employee.status;
    document.getElementById('employeeAddress').value = employee.address || '';
    
    if (employee.joiningDate) {
      const date = new Date(employee.joiningDate);
      document.getElementById('employeeJoiningDate').value = date.toISOString().split('T')[0];
    }
    
    openModal('employeeModal');
  } catch (error) {
    showAlert('Failed to load employee: ' + error.message, 'error');
  }
}

// Save employee
async function saveEmployee() {
  try {
    const employeeId = document.getElementById('employeeId').value;
    const employeeData = {
      name: document.getElementById('employeeName').value.trim(),
      phone: document.getElementById('employeePhone').value.trim(),
      role: document.getElementById('employeeRole').value,
      salary: parseFloat(document.getElementById('employeeSalary').value),
      status: document.getElementById('employeeStatus').value,
      address: document.getElementById('employeeAddress').value.trim()
    };
    
    const joiningDate = document.getElementById('employeeJoiningDate').value;
    if (joiningDate) {
      employeeData.joiningDate = joiningDate;
    }
    
    if (employeeId) {
      await employeeAPI.update(employeeId, employeeData);
      showAlert('Employee updated successfully', 'success');
    } else {
      await employeeAPI.create(employeeData);
      showAlert('Employee created successfully', 'success');
    }
    
    closeModal('employeeModal');
    loadEmployees();
  } catch (error) {
    showAlert('Failed to save employee: ' + error.message, 'error');
  }
}

// Delete employee
async function deleteEmployee(employeeId) {
  if (!confirmAction('Are you sure you want to delete this employee?')) {
    return;
  }
  
  try {
    await employeeAPI.delete(employeeId);
    showAlert('Employee deleted successfully', 'success');
    loadEmployees();
  } catch (error) {
    showAlert('Failed to delete employee: ' + error.message, 'error');
  }
}

