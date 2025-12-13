// frontend/js/services.js

// Load services on page load
document.addEventListener('DOMContentLoaded', () => {
  loadServices();
});

// Load services with filters
async function loadServices() {
  showLoading('servicesTableBody');
  
  try {
    const filters = {};
    const status = document.getElementById('statusFilter').value;
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    
    if (status) filters.status = status;
    if (dateFrom) filters.startDate = dateFrom;
    if (dateTo) filters.endDate = dateTo;
    
    const response = await serviceAPI.getAll(filters);
    const services = response.data;
    
    displayServices(services);
  } catch (error) {
    document.getElementById('servicesTableBody').innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-danger">Error loading services: ${error.message}</td>
      </tr>
    `;
  }
}

// Display services in table
function displayServices(services) {
  const tbody = document.getElementById('servicesTableBody');
  
  if (!services || services.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted">No services found</td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = services.map(service => {
    const customer = service.customerId || {};
    const vehicle = service.vehicleId || {};
    
    return `
      <tr>
        <td>${service._id.toString().substring(0, 8)}...</td>
        <td>${customer.name || 'N/A'}<br><small class="text-muted">${customer.phone || ''}</small></td>
        <td>${vehicle.vehicleNumber || 'N/A'}<br><small class="text-muted">${vehicle.vehicleType || ''}</small></td>
        <td><span class="badge ${getStatusBadgeClass(service.status)}">${service.status}</span></td>
        <td>${formatCurrency(service.totalAmount)}</td>
        <td>${formatDate(service.serviceDate || service.createdAt)}</td>
        <td>
          <a href="service-details.html?id=${service._id}" class="btn btn-sm btn-primary">View</a>
        </td>
      </tr>
    `;
  }).join('');
}

