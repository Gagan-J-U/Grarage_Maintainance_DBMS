// frontend/js/serviceDetails.js

let currentService = null;
let allParts = [];
let allEmployees = [];

// Get service ID from URL
const serviceId = getQueryParam('id');

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  if (!serviceId) {
    showAlert('No service ID provided', 'error');
    setTimeout(() => window.location.href = 'services.html', 2000);
    return;
  }

  await loadServiceDetails();
  await loadEmployees();
  
  // Setup part search
  const partSearchInput = document.getElementById('partSearch');
  if (partSearchInput) {
    partSearchInput.addEventListener('input', debounce(searchParts, 300));
  }
});

// Load service details
async function loadServiceDetails() {
  try {
    const response = await serviceAPI.getById(serviceId);
    currentService = response.data;
    
    displayServiceDetails(currentService);
    displayParts(currentService.partsUsed);
    updateSummary();
    
    // Pre-select service types
    if (currentService.servicesRequested) {
      currentService.servicesRequested.forEach(type => {
        const checkbox = document.querySelector(`.service-checkbox[value="${type}"]`);
        if (checkbox) checkbox.checked = true;
      });
    }
    
    // Set description and labor charges
    const descInput = document.getElementById('serviceDescription');
    const laborInput = document.getElementById('laborCharges');
    if (descInput) descInput.value = currentService.description || '';
    if (laborInput) laborInput.value = currentService.laborCharges || 0;
    
    // Update summary immediately
    updateSummary();
    
  } catch (error) {
    showAlert('Failed to load service details: ' + error.message, 'error');
  }
}

// Display service details
function displayServiceDetails(service) {
  // Status
  const statusBadge = document.getElementById('statusBadge');
  statusBadge.textContent = service.status;
  statusBadge.className = `badge ${getStatusBadgeClass(service.status)}`;
  
  // Service info
  document.getElementById('serviceInfo').textContent = 
    `Created: ${formatDate(service.createdAt)}`;
  
  // Customer info
  const customer = service.customerId;
  document.getElementById('customerInfo').textContent = customer.name;
  document.getElementById('phoneInfo').textContent = formatPhoneNumber(customer.phone);
  
  // Vehicle info
  const vehicle = service.vehicleId;
  document.getElementById('vehicleInfo').textContent = 
    `${vehicle.vehicleNumber} (${vehicle.vehicleType})`;
}

// Display parts
function displayParts(parts) {
  const tbody = document.getElementById('partsTableBody');
  
  if (!parts || parts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted">No parts added yet</td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = parts.map((part, index) => `
    <tr>
      <td>${part.partName}</td>
      <td>${part.quantity}</td>
      <td>${formatCurrency(part.pricePerUnit)}</td>
      <td>${formatCurrency(part.totalPrice)}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="removePart(${index})">
          Remove
        </button>
      </td>
    </tr>
  `).join('');
}

// Update service summary
function updateSummary() {
  if (!currentService) return;
  
  const partsTotal = (currentService.partsUsed || []).reduce((sum, part) => sum + (part.totalPrice || 0), 0);
  const laborCharges = currentService.laborCharges || 0;
  const total = partsTotal + laborCharges;
  
  // Update service total amount if it doesn't match
  if (currentService.totalAmount !== total) {
    currentService.totalAmount = total;
  }
  
  const partsTotalEl = document.getElementById('partsTotal');
  const laborTotalEl = document.getElementById('laborTotal');
  const grandTotalEl = document.getElementById('grandTotal');
  
  if (partsTotalEl) partsTotalEl.textContent = formatCurrency(partsTotal);
  if (laborTotalEl) laborTotalEl.textContent = formatCurrency(laborCharges);
  if (grandTotalEl) grandTotalEl.textContent = formatCurrency(total);
}

// Load employees
async function loadEmployees() {
  try {
    const response = await employeeAPI.getAll('Active');
    allEmployees = response.data;
    
    const select = document.getElementById('employeeSelect');
    select.innerHTML = allEmployees.map(emp => `
      <option value="${emp._id}" ${currentService.assignedEmployees.some(e => e._id === emp._id) ? 'selected' : ''}>
        ${emp.name} (${emp.role})
      </option>
    `).join('');
  } catch (error) {
    console.error('Failed to load employees:', error);
  }
}

// Update service types
async function updateServiceTypes() {
  try {
    if (!serviceId) {
      showAlert('Service ID is missing', 'error');
      return;
    }
    
    const selectedTypes = Array.from(document.querySelectorAll('.service-checkbox:checked'))
      .map(cb => cb.value);
    
    const description = document.getElementById('serviceDescription').value.trim();
    const laborChargesInput = document.getElementById('laborCharges');
    const laborCharges = parseFloat(laborChargesInput.value) || 0;
    
    // Calculate parts total from current service
    const partsTotal = (currentService && currentService.partsUsed) 
      ? currentService.partsUsed.reduce((sum, part) => sum + (part.totalPrice || 0), 0)
      : 0;
    
    // Update total amount
    const totalAmount = partsTotal + laborCharges;
    
    const response = await serviceAPI.update(serviceId, {
      servicesRequested: selectedTypes,
      description,
      laborCharges,
      totalAmount
    });
    
    if (response.success) {
      currentService = response.data;
      updateSummary();
      showAlert('Service details updated successfully', 'success');
    } else {
      throw new Error(response.error || 'Failed to update service');
    }
  } catch (error) {
    console.error('Update service error:', error);
    showAlert('Failed to update service: ' + error.message, 'error');
  }
}

// Search parts
async function searchParts(e) {
  const query = e.target.value.trim();
  const resultsDiv = document.getElementById('partSearchResults');
  
  if (query.length < 2) {
    resultsDiv.innerHTML = '';
    return;
  }
  
  try {
    const response = await partsAPI.search(query);
    const parts = response.data;
    
    if (parts.length === 0) {
      resultsDiv.innerHTML = '<p class="text-muted text-center">No parts found</p>';
      return;
    }
    
    resultsDiv.innerHTML = parts.map(part => {
      // Escape special characters for onclick
      const partId = part._id.toString().replace(/'/g, "\\'");
      const partName = part.partName.replace(/'/g, "\\'");
      return `
        <div style="padding: 10px; border: 1px solid var(--border-color); margin-bottom: 5px; cursor: pointer; border-radius: 4px;"
             onclick="selectPart('${partId}', '${partName}', ${part.price}, ${part.quantityAvailable})">
          <div style="font-weight: 600;">${part.partName}</div>
          <div style="font-size: 12px; color: var(--text-secondary);">
            ${part.partNumber} | Stock: ${part.quantityAvailable} | ${formatCurrency(part.price)}
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Search failed:', error);
    resultsDiv.innerHTML = '<p class="text-danger text-center">Error searching parts</p>';
  }
}

// Select part
function selectPart(partId, partName, price, availableQty) {
  document.getElementById('selectedPartId').value = partId;
  document.getElementById('selectedPartName').value = `${partName} (Available: ${availableQty})`;
  document.getElementById('partPrice').value = price;
  document.getElementById('partQuantity').max = availableQty;
  document.getElementById('partSearchResults').innerHTML = '';
}

// Add part to service
async function addPartToService() {
  try {
    const partId = document.getElementById('selectedPartId').value;
    const quantityInput = document.getElementById('partQuantity');
    const quantity = parseInt(quantityInput.value);
    const maxQty = parseInt(quantityInput.max) || 999;
    
    if (!partId) {
      showAlert('Please select a part first', 'error');
      return;
    }
    
    if (!quantity || quantity < 1) {
      showAlert('Please enter a valid quantity (minimum 1)', 'error');
      return;
    }
    
    if (quantity > maxQty) {
      showAlert(`Quantity cannot exceed available stock (${maxQty})`, 'error');
      return;
    }
    
    // Show loading state
    const addBtn = document.querySelector('#addPartModal .btn-primary');
    const originalText = addBtn ? addBtn.textContent : 'Add Part';
    if (addBtn) {
      addBtn.disabled = true;
      addBtn.textContent = 'Adding...';
    }
    
    const response = await serviceAPI.addParts({
      serviceId: serviceId,
      parts: [{ partId, quantity }]
    });
    
    if (response.success) {
      currentService = response.data;
      displayParts(currentService.partsUsed);
      updateSummary();
      
      closeModal('addPartModal');
      showAlert('Part added successfully', 'success');
      
      // Reset form
      document.getElementById('partSearch').value = '';
      document.getElementById('selectedPartId').value = '';
      document.getElementById('selectedPartName').value = '';
      document.getElementById('partPrice').value = '';
      document.getElementById('partQuantity').value = '1';
      document.getElementById('partQuantity').max = '';
      document.getElementById('partSearchResults').innerHTML = '';
    } else {
      throw new Error(response.error || 'Failed to add part');
    }
  } catch (error) {
    showAlert('Failed to add part: ' + error.message, 'error');
  } finally {
    // Restore button state
    const addBtn = document.querySelector('#addPartModal .btn-primary');
    if (addBtn) {
      addBtn.disabled = false;
      addBtn.textContent = 'Add Part';
    }
  }
}

// Remove part
async function removePart(partIndex) {
  if (!confirmAction('Are you sure you want to remove this part?')) {
    return;
  }
  
  try {
    const response = await serviceAPI.removePart({
      serviceId: serviceId,
      partIndex: partIndex
    });
    
    currentService = response.data;
    displayParts(currentService.partsUsed);
    updateSummary();
    
    showAlert('Part removed successfully', 'success');
  } catch (error) {
    showAlert('Failed to remove part: ' + error.message, 'error');
  }
}

// Update employees
async function updateEmployees() {
  try {
    const select = document.getElementById('employeeSelect');
    const selectedEmployees = Array.from(select.selectedOptions).map(opt => opt.value);
    
    const response = await serviceAPI.update(serviceId, {
      assignedEmployees: selectedEmployees
    });
    
    currentService = response.data;
    showAlert('Employees updated successfully', 'success');
  } catch (error) {
    showAlert('Failed to update employees: ' + error.message, 'error');
  }
}

// Update service status
async function updateStatus(newStatus) {
  const confirmMessages = {
    'In Progress': 'Mark this service as In Progress?',
    'Completed': 'Mark this service as Completed? A payment entry will be created.',
    'Cancelled': 'Cancel this service? This action cannot be undone.'
  };
  
  if (!confirmAction(confirmMessages[newStatus])) {
    return;
  }
  
  try {
    const response = await serviceAPI.updateStatus({
      serviceId: serviceId,
      status: newStatus
    });
    
    if (response.success) {
      currentService = response.data;
      displayServiceDetails(currentService);
      
      showAlert(`Service marked as ${newStatus}`, 'success');
      
      if (newStatus === 'Completed') {
        showAlert('Service completed! Payment entry created. You can now process payment in the Payments page.', 'success');
        // Optionally redirect to payments page after a delay
        // setTimeout(() => {
        //   window.location.href = `/pages/payments.html`;
        // }, 2000);
      }
    } else {
      throw new Error(response.error || 'Failed to update service status');
    }
  } catch (error) {
    showAlert('Failed to update status: ' + error.message, 'error');
  }
}