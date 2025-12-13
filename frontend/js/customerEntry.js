// frontend/js/customerEntry.js

let currentCustomer = null;
let currentVehicle = null;

// Phone number input handler with debounce
document.addEventListener('DOMContentLoaded', () => {
  const phoneInput = document.getElementById('phoneNumber');
  if (phoneInput) {
    phoneInput.addEventListener('input', debounce(async (e) => {
      const phone = e.target.value.trim();
      
      if (phone.length === 10) {
        await checkCustomer(phone);
      } else if (phone.length < 10) {
        resetCustomerFields();
        hideExistingVehicles();
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
});

// Vehicle number input handler is now in DOMContentLoaded

// Check if customer exists
async function checkCustomer(phone) {
  try {
    if (!phone || phone.length !== 10) {
      return;
    }
    
    const response = await customerAPI.getByPhone(phone);
    
    if (response && response.success && response.data) {
      currentCustomer = response.data.customer;
      const vehicles = response.data.vehicles || [];
      
      // Auto-fill customer details
      const nameInput = document.getElementById('customerName');
      const emailInput = document.getElementById('customerEmail');
      const addressInput = document.getElementById('customerAddress');
      
      if (nameInput) {
        nameInput.value = currentCustomer.name || '';
        nameInput.style.background = '#f0fdf4';
      }
      if (emailInput) {
        emailInput.value = currentCustomer.email || '';
        emailInput.style.background = '#f0fdf4';
      }
      if (addressInput) {
        addressInput.value = currentCustomer.address || '';
        addressInput.style.background = '#f0fdf4';
      }
      
      // Display existing vehicles if any
      if (vehicles && vehicles.length > 0) {
        displayExistingVehicles(vehicles);
        showAlert('Customer found! Select a vehicle or add new one.', 'success');
      } else {
        hideExistingVehicles();
        showAlert('Customer found! Please add vehicle details.', 'success');
      }
    } else {
      // Customer not found - allow new entry
      currentCustomer = null;
      resetCustomerFields();
      hideExistingVehicles();
    }
  } catch (error) {
    // Customer not found - allow new entry
    console.log('Customer not found, allowing new entry');
    currentCustomer = null;
    resetCustomerFields();
    hideExistingVehicles();
  }
}

// Display existing vehicles
function displayExistingVehicles(vehicles) {
  const container = document.getElementById('existingVehiclesContainer');
  const list = document.getElementById('existingVehiclesList');
  const newVehicleForm = document.getElementById('newVehicleForm');
  
  if (!container || !list) {
    console.error('Vehicle container elements not found');
    return;
  }
  
  container.style.display = 'block';
  if (newVehicleForm) {
    newVehicleForm.style.display = 'none';
  }
  
  // Clear previous selection
  const selectedVehicleIdInput = document.getElementById('selectedVehicleId');
  if (selectedVehicleIdInput) {
    selectedVehicleIdInput.value = '';
  }
  currentVehicle = null;
  
  list.innerHTML = vehicles.map(vehicle => {
    const vehicleId = vehicle._id ? (typeof vehicle._id === 'object' ? vehicle._id.toString() : vehicle._id) : '';
    const vehicleNumber = vehicle.vehicleNumber || '';
    const vehicleType = vehicle.vehicleType || '';
    const brand = vehicle.brand || '';
    const model = vehicle.model || '';
    
    return `
    <div class="vehicle-item" 
         data-vehicle-id="${vehicleId}"
         style="padding: 12px; border: 2px solid var(--border-color); border-radius: 6px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s;"
         onclick="selectExistingVehicle('${vehicleId}', '${vehicleNumber}', '${vehicleType}')"
         onmouseover="if(!this.classList.contains('selected')) { this.style.borderColor='var(--primary-color)'; this.style.background='#f0f7ff'; }"
         onmouseout="if(!this.classList.contains('selected')) { this.style.borderColor='var(--border-color)'; this.style.background=''; }">
      <div style="font-weight: 600;">${vehicleNumber}</div>
      <div style="font-size: 13px; color: var(--text-secondary);">
        ${vehicleType} ${brand ? '• ' + brand : ''} ${model ? '• ' + model : ''}
      </div>
    </div>
  `;
  }).join('');
}

// Hide existing vehicles
function hideExistingVehicles() {
  document.getElementById('existingVehiclesContainer').style.display = 'none';
  document.getElementById('newVehicleForm').style.display = 'block';
}

// Show new vehicle form
function showNewVehicleForm() {
  document.getElementById('existingVehiclesContainer').style.display = 'none';
  document.getElementById('newVehicleForm').style.display = 'block';
  document.getElementById('selectedVehicleId').value = '';
  currentVehicle = null;
}

// Select existing vehicle
function selectExistingVehicle(vehicleId, vehicleNumber, vehicleType) {
  const selectedVehicleIdInput = document.getElementById('selectedVehicleId');
  if (selectedVehicleIdInput) {
    selectedVehicleIdInput.value = vehicleId;
  }
  
  currentVehicle = { _id: vehicleId, vehicleNumber, vehicleType };
  
  // Highlight selected vehicle
  const list = document.getElementById('existingVehiclesList');
  if (list) {
    const items = list.querySelectorAll('.vehicle-item');
    items.forEach(item => {
      item.classList.remove('selected');
      item.style.borderColor = 'var(--border-color)';
      item.style.background = '';
    });
    
    // Find and highlight the selected item
    const selectedItem = list.querySelector(`[data-vehicle-id="${vehicleId}"]`);
    if (selectedItem) {
      selectedItem.classList.add('selected');
      selectedItem.style.borderColor = 'var(--primary-color)';
      selectedItem.style.background = '#e0f2fe';
    }
  }
  
  // Hide new vehicle form
  const newVehicleForm = document.getElementById('newVehicleForm');
  if (newVehicleForm) {
    newVehicleForm.style.display = 'none';
  }
  
  showAlert(`Vehicle ${vehicleNumber} selected`, 'success');
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
  
  hideExistingVehicles();
  document.getElementById('selectedVehicleId').value = '';
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
      const phone = document.getElementById('phoneNumber').value.trim();
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
      if (!isValidPhone(phone)) {
        throw new Error('Invalid phone number');
      }
      
      // Create or update customer
      const customerResponse = await customerAPI.createOrUpdate({
        phone,
        name: customerName,
        email: customerEmail,
        address: customerAddress
      });
      
      const customerId = customerResponse.data._id;
      
      // Check if existing vehicle is selected
      const selectedVehicleId = document.getElementById('selectedVehicleId').value;
      let vehicleId;
      
      if (selectedVehicleId) {
        // Use existing vehicle
        vehicleId = selectedVehicleId;
      } else {
        // Validate vehicle fields for new vehicle
        if (!vehicleNumber || !vehicleType) {
          throw new Error('Vehicle number and type are required');
        }
        
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
        
        vehicleId = vehicleResponse.data._id;
      }
      
      // Create service entry
      const serviceResponse = await serviceAPI.create({
        customerId,
        vehicleId,
        servicesRequested: [],
        laborCharges: 0
      });
      
      showAlert('Service entry created successfully! Redirecting...', 'success');
      
      // Redirect to service page
      setTimeout(() => {
        window.location.href = `/pages/service-details.html?id=${serviceResponse.data._id}`;
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

