// frontend/js/history.js

// Load history on page load
document.addEventListener('DOMContentLoaded', () => {
  loadHistory();
});

// Load history with filters
async function loadHistory() {
  showLoading('historyTableBody');
  
  try {
    const filters = {};
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    const phone = document.getElementById('phoneFilter').value.trim();
    const vehicleNumber = document.getElementById('vehicleFilter').value.trim();
    
    if (dateFrom) filters.startDate = dateFrom;
    if (dateTo) filters.endDate = dateTo;
    if (phone) filters.phone = phone;
    if (vehicleNumber) filters.vehicleNumber = vehicleNumber;
    
    const response = await historyAPI.getAll(filters);
    const history = response.data;
    displayHistory(history);
  } catch (error) {
    document.getElementById('historyTableBody').innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-danger">Error loading history: ${error.message}</td>
      </tr>
    `;
  }
}

// Display history in table
function displayHistory(history) {
  const tbody = document.getElementById('historyTableBody');
  
  if (!history || history.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted">No history found</td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = history.map(item => {
    const customer = item.customerId || {};
    const vehicle = item.vehicleId || {};
    const snapshot = item.serviceSnapshot || {};
    
    const serviceTypes = snapshot.servicesRequested || [];
    
    // Extract serviceId - handle both object and string
    let serviceIdStr = '';
    if (item.serviceId) {
      if (typeof item.serviceId === 'object' && item.serviceId !== null) {
        serviceIdStr = item.serviceId._id ? item.serviceId._id.toString() : item.serviceId.toString();
      } else {
        serviceIdStr = item.serviceId.toString();
      }
    }
    
    // Extract customerId - handle both object and string
    let customerIdStr = '';
    if (item.customerId) {
      if (typeof item.customerId === 'object' && item.customerId !== null) {
        customerIdStr = item.customerId._id ? item.customerId._id.toString() : item.customerId.toString();
      } else {
        customerIdStr = item.customerId.toString();
      }
    }
    
    return `
      <tr>
        <td>${formatDate(item.completionDate)}</td>
        <td>${customer.name || 'N/A'}</td>
        <td>${formatPhoneNumber(customer.phone)}</td>
        <td>${vehicle.vehicleNumber || 'N/A'}<br><small class="text-muted">${vehicle.vehicleType || ''}</small></td>
        <td>${serviceTypes.length > 0 ? serviceTypes.join(', ') : 'N/A'}</td>
        <td>${formatCurrency(snapshot.totalAmount || 0)}</td>
        <td>
          <button onclick="viewHistoryDetails('${item._id}')" class="btn btn-sm btn-primary">View Details</button>
          ${serviceIdStr && customerIdStr ? `<button onclick="openFeedbackForService('${serviceIdStr}', '${customerIdStr}')" class="btn btn-sm btn-secondary">Give Feedback</button>` : ''}
        </td>
      </tr>
    `;
  }).join('');
}

// Open feedback modal for a service
function openFeedbackForService(serviceId, customerId) {
  // Redirect to feedback page with parameters
  window.location.href = `/pages/feedback.html?serviceId=${serviceId}&customerId=${customerId}`;
}

// View history details
async function viewHistoryDetails(historyId) {
  try {
    const response = await historyAPI.getById(historyId);
    const history = response.data;
    
    const customer = history.customerId || {};
    const vehicle = history.vehicleId || {};
    const snapshot = history.serviceSnapshot || {};
    
    const detailsHTML = `
      <div style="margin-bottom: 20px;">
        <h4>Customer Information</h4>
        <div style="padding: 15px; background: var(--light-gray); border-radius: 6px;">
          <div><strong>Name:</strong> ${customer.name || 'N/A'}</div>
          <div><strong>Phone:</strong> ${formatPhoneNumber(customer.phone)}</div>
          <div><strong>Email:</strong> ${customer.email || 'N/A'}</div>
          <div><strong>Address:</strong> ${customer.address || 'N/A'}</div>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h4>Vehicle Information</h4>
        <div style="padding: 15px; background: var(--light-gray); border-radius: 6px;">
          <div><strong>Vehicle Number:</strong> ${vehicle.vehicleNumber || 'N/A'}</div>
          <div><strong>Type:</strong> ${vehicle.vehicleType || 'N/A'}</div>
          <div><strong>Brand:</strong> ${vehicle.brand || 'N/A'}</div>
          <div><strong>Model:</strong> ${vehicle.model || 'N/A'}</div>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h4>Service Details</h4>
        <div style="padding: 15px; background: var(--light-gray); border-radius: 6px;">
          <div><strong>Completion Date:</strong> ${formatDate(history.completionDate)}</div>
          <div><strong>Service Types:</strong> ${(snapshot.servicesRequested || []).join(', ') || 'N/A'}</div>
          <div><strong>Description:</strong> ${snapshot.description || 'N/A'}</div>
        </div>
      </div>
      
      ${snapshot.partsUsed && snapshot.partsUsed.length > 0 ? `
      <div style="margin-bottom: 20px;">
        <h4>Parts Used</h4>
        <table style="width: 100%;">
          <thead>
            <tr style="background: var(--light-gray);">
              <th style="padding: 10px; text-align: left;">Part Name</th>
              <th style="padding: 10px; text-align: center;">Quantity</th>
              <th style="padding: 10px; text-align: right;">Price</th>
              <th style="padding: 10px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${snapshot.partsUsed.map(part => `
              <tr>
                <td style="padding: 10px;">${part.partName}</td>
                <td style="padding: 10px; text-align: center;">${part.quantity}</td>
                <td style="padding: 10px; text-align: right;">${formatCurrency(part.pricePerUnit)}</td>
                <td style="padding: 10px; text-align: right;">${formatCurrency(part.totalPrice)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}
      
      <div style="margin-bottom: 20px;">
        <h4>Summary</h4>
        <div style="padding: 15px; background: var(--light-gray); border-radius: 6px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Parts Total:</span>
            <strong>${formatCurrency((snapshot.partsUsed || []).reduce((sum, p) => sum + (p.totalPrice || 0), 0))}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Labor Charges:</span>
            <strong>${formatCurrency(snapshot.laborCharges || 0)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 2px solid var(--border-color);">
            <span style="font-size: 18px; font-weight: 600;">Total Amount:</span>
            <strong style="font-size: 18px; color: var(--primary-color);">${formatCurrency(snapshot.totalAmount || 0)}</strong>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('historyDetailsContent').innerHTML = detailsHTML;
    openModal('historyDetailsModal');
  } catch (error) {
    showAlert('Failed to load history details: ' + error.message, 'error');
  }
}

