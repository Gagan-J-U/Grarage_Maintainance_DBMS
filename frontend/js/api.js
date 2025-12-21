// frontend/js/api.js
// API Base URL - Use relative path since frontend is served by the same Express server
// This automatically uses whatever port the server is running on
const API_BASE_URL = '/api';

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

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    // Enhanced error logging
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('API Error: Network error - Is the server running?', error);
      throw new Error('Cannot connect to server. Please check if the server is running.');
    }
    console.error('API Error:', error.message || error);
    throw error;
  }
}

// Customer API
const customerAPI = {
  getByPhone: (phone) => apiCall(`/customers/phone/${phone}`),
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
    return apiCall(`/history?${params}`);
  },
  getById: (id) => apiCall(`/history/${id}`)
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

// Export APIs for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    customerAPI,
    vehicleAPI,
    serviceAPI,
    employeeAPI,
    partsAPI,
    paymentAPI,
    feedbackAPI,
    dashboardAPI,
    historyAPI
  };
}