// frontend/js/customerEntry.js

let currentCustomer = null;
let currentVehicle = null;

// Phone number input handler with debounce
const phoneInput = document.getElementById('phoneNumber');
if (phoneInput) {
  phoneInput.addEventListener('input', debounce(async (e) => {
    const phone = e.target.value.trim();
    
    if (phone.length === 10) {
      await checkCustomer(phone);
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
async function checkCustomer(phone) {
  try {
    const response = await customerAPI.getByPhone(phone);
    
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
        servicesRequested: [],
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

