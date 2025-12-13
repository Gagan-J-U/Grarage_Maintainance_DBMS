// frontend/js/api.js
// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Generic API call function
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Customer API
const customerAPI = {
  getByPhone: (phoneNumber) => apiCall(`/customers/phone/${phoneNumber}`),
  createOrUpdate: (data) => apiCall('/customers', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getAll: () => apiCall('/customers'),
  search: (query) => apiCall(`/customers/search?query=${query}`)
};

// Vehicle API
const vehicleAPI = {
  getByNumber: (vehicleNumber) => apiCall(`/vehicles/number/${vehicleNumber}`),
  createOrUpdate: (data) => apiCall('/vehicles', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getByCustomer: (customerId) => apiCall(`/vehicles/customer/${customerId}`)
};

// Service API
const serviceAPI = {
  create: (data) => apiCall('/services', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/services?${params}`);
  },
  getById: (id) => apiCall(`/services/${id}`),
  update: (id, data) => apiCall(`/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  addParts: (data) => apiCall('/services/add-parts', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  removePart: (data) => apiCall('/services/remove-part', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateStatus: (data) => apiCall('/services/update-status', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

// Employee API
const employeeAPI = {
  getAll: (status) => {
    const params = status ? `?status=${status}` : '';
    return apiCall(`/employees${params}`);
  },
  getById: (id) => apiCall(`/employees/${id}`),
  create: (data) => apiCall('/employees', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiCall(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiCall(`/employees/${id}`, {
    method: 'DELETE'
  })
};

// Parts API
const partsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/parts?${params}`);
  },
  getById: (id) => apiCall(`/parts/${id}`),
  search: (query) => apiCall(`/parts/search?query=${query}`),
  create: (data) => apiCall('/parts', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiCall(`/parts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  updateQuantity: (data) => apiCall('/parts/update-quantity', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiCall(`/parts/${id}`, {
    method: 'DELETE'
  })
};

// Payment API
const paymentAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/payments?${params}`);
  },
  getById: (id) => apiCall(`/payments/${id}`),
  getByService: (serviceId) => apiCall(`/payments/service/${serviceId}`),
  process: (data) => apiCall('/payments/process', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiCall(`/payments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
};

// Feedback API
const feedbackAPI = {
  create: (data) => apiCall('/feedback', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getAll: () => apiCall('/feedback'),
  getByService: (serviceId) => apiCall(`/feedback/service/${serviceId}`)
};

// Dashboard API
const dashboardAPI = {
  getStats: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/dashboard/stats?${params}`);
  }
};

// Service History API
const historyAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/api/service-history?${params}`);
  },
  getById: (id) => apiCall(`/api/service-history/${id}`)
};

// ============================================
// frontend/js/utils.js

// Show alert message
function showAlert(message, type = 'success') {
  const alertDiv = document.getElementById('alertMessage');
  if (!alertDiv) return;

  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  alertDiv.classList.remove('hidden');

  // Auto hide after 5 seconds
  setTimeout(() => {
    alertDiv.classList.add('hidden');
  }, 5000);
}

// Hide alert
function hideAlert() {
  const alertDiv = document.getElementById('alertMessage');
  if (alertDiv) {
    alertDiv.classList.add('hidden');
  }
}

// Format date
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

// Format currency
function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '₹0';
  return `₹${parseFloat(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

// Format phone number
function formatPhoneNumber(phone) {
  if (!phone) return '-';
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
}

// Show loading spinner
function showLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p style="margin-top: 15px; color: var(--text-secondary);">Loading...</p>
      </div>
    `;
  }
}

// Get status badge class
function getStatusBadgeClass(status) {
  const statusMap = {
    'Completed': 'badge-success',
    'Paid': 'badge-success',
    'In Progress': 'badge-warning',
    'Pending': 'badge-warning',
    'Partial': 'badge-warning',
    'Cancelled': 'badge-danger',
    'Active': 'badge-success',
    'Inactive': 'badge-gray'
  };
  return statusMap[status] || 'badge-gray';
}

// Validate email
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate phone
function isValidPhone(phone) {
  const re = /^[0-9]{10}$/;
  return re.test(phone);
}

// Debounce function
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Confirm dialog
function confirmAction(message) {
  return confirm(message);
}

// Modal utilities
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// Get query parameter
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Set active nav link
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
}

// Initialize - call on page load
document.addEventListener('DOMContentLoaded', () => {
  setActiveNavLink();
});

// ============================================
// frontend/js/customerEntry.js

let currentCustomer = null;
let currentVehicle = null;

// Phone number input handler with debounce
const phoneInput = document.getElementById('phoneNumber');
if (phoneInput) {
  phoneInput.addEventListener('input', debounce(async (e) => {
    const phoneNumber = e.target.value.trim();
    
    if (phoneNumber.length === 10) {
      await checkCustomer(phoneNumber);
    } else {
      resetCustomerFields();
    }
  }, 500));
}

// Vehicle number input handler
const vehicleNumberInput = document.getElementById('vehicleNumber');
if (vehicleNumberInput) {
  vehicleNumberInput.addEventListener('input', debounce(async (e) => {
    const vehicleNumber = e.target.value.trim().toUpperCase();
    
    if (vehicleNumber.length >= 6 && currentCustomer) {
      await checkVehicle(vehicleNumber);
    }
  }, 500));
}

// Check if customer exists
async function checkCustomer(phoneNumber) {
  try {
    const response = await customerAPI.getByPhone(phoneNumber);
    
    if (response.success) {
      currentCustomer = response.data.customer;
      
      // Auto-fill customer details
      document.getElementById('customerName').value = currentCustomer.name;
      document.getElementById('customerEmail').value = currentCustomer.email || '';
      document.getElementById('customerAddress').value = currentCustomer.address || '';
      
      // Make fields readonly (but editable if needed)
      document.getElementById('customerName').style.background = '#f0fdf4';
      document.getElementById('customerEmail').style.background = '#f0fdf4';
      document.getElementById('customerAddress').style.background = '#f0fdf4';
      
      showAlert('Customer found! Details auto-filled.', 'success');
    }
  } catch (error) {
    // Customer not found - allow new entry
    currentCustomer = null;
    resetCustomerFields();
  }
}

// Check if vehicle exists
async function checkVehicle(vehicleNumber) {
  try {
    const response = await vehicleAPI.getByNumber(vehicleNumber);
    
    if (response.success) {
      currentVehicle = response.data;
      
      // Auto-fill vehicle details
      document.getElementById('vehicleType').value = currentVehicle.vehicleType;
      document.getElementById('vehicleBrand').value = currentVehicle.brand || '';
      document.getElementById('vehicleModel').value = currentVehicle.model || '';
      document.getElementById('vehicleYear').value = currentVehicle.year || '';
      document.getElementById('vehicleColor').value = currentVehicle.color || '';
      
      // Style to show auto-filled
      const vehicleFields = ['vehicleType', 'vehicleBrand', 'vehicleModel', 'vehicleYear', 'vehicleColor'];
      vehicleFields.forEach(field => {
        document.getElementById(field).style.background = '#f0fdf4';
      });
      
      showAlert('Vehicle found! Details auto-filled.', 'info');
    }
  } catch (error) {
    // Vehicle not found - allow new entry
    currentVehicle = null;
  }
}

// Reset customer fields
function resetCustomerFields() {
  document.getElementById('customerName').value = '';
  document.getElementById('customerEmail').value = '';
  document.getElementById('customerAddress').value = '';
  
  document.getElementById('customerName').style.background = '';
  document.getElementById('customerEmail').style.background = '';
  document.getElementById('customerAddress').style.background = '';
}

// Form submission
const form = document.getElementById('customerVehicleForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Processing...</span>';
    
    try {
      // Get form data
      const phoneNumber = document.getElementById('phoneNumber').value.trim();
      const customerName = document.getElementById('customerName').value.trim();
      const customerEmail = document.getElementById('customerEmail').value.trim();
      const customerAddress = document.getElementById('customerAddress').value.trim();
      
      const vehicleNumber = document.getElementById('vehicleNumber').value.trim().toUpperCase();
      const vehicleType = document.getElementById('vehicleType').value;
      const vehicleBrand = document.getElementById('vehicleBrand').value.trim();
      const vehicleModel = document.getElementById('vehicleModel').value.trim();
      const vehicleYear = document.getElementById('vehicleYear').value;
      const vehicleColor = document.getElementById('vehicleColor').value.trim();
      
      // Validate
      if (!isValidPhone(phoneNumber)) {
        throw new Error('Invalid phone number');
      }
      
      // Create or update customer
      const customerResponse = await customerAPI.createOrUpdate({
        phoneNumber,
        name: customerName,
        email: customerEmail,
        address: customerAddress
      });
      
      const customerId = customerResponse.data._id;
      
      // Create or update vehicle
      const vehicleResponse = await vehicleAPI.createOrUpdate({
        vehicleNumber,
        customerId,
        vehicleType,
        brand: vehicleBrand,
        model: vehicleModel,
        year: vehicleYear ? parseInt(vehicleYear) : null,
        color: vehicleColor
      });
      
      const vehicleId = vehicleResponse.data._id;
      
      // Create service entry
      const serviceResponse = await serviceAPI.create({
        customerId,
        vehicleId,
        serviceTypes: [],
        laborCharges: 0
      });
      
      showAlert('Service entry created successfully! Redirecting...', 'success');
      
      // Redirect to service page
      setTimeout(() => {
        window.location.href = `service-details.html?id=${serviceResponse.data._id}`;
      }, 1500);
      
    } catch (error) {
      showAlert(error.message, 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Create Service Entry</span>';
    }
  });
}

// Reset form
function resetForm() {
  form.reset();
  currentCustomer = null;
  currentVehicle = null;
  resetCustomerFields();
  hideAlert();
}