// frontend/js/feedback.js

let currentRating = 0;

// Load feedback on page load
document.addEventListener('DOMContentLoaded', async () => {
  loadFeedback();
  
  // Check if service ID is in URL for adding feedback
  const serviceId = getQueryParam('serviceId');
  const customerId = getQueryParam('customerId');
  if (serviceId && customerId) {
    // Show submit feedback card
    const submitCard = document.getElementById('submitFeedbackCard');
    if (submitCard) {
      submitCard.style.display = 'block';
      
      // Try to load service info
      try {
        const serviceResponse = await serviceAPI.getById(serviceId);
        if (serviceResponse.success && serviceResponse.data) {
          const service = serviceResponse.data;
          const customer = service.customerId || {};
          const vehicle = service.vehicleId || {};
          document.getElementById('feedbackServiceInfo').textContent = 
            `Service for ${customer.name || 'Customer'} - Vehicle: ${vehicle.vehicleNumber || 'N/A'}`;
        }
      } catch (error) {
        console.error('Error loading service info:', error);
      }
    }
    
    // Small delay to ensure modal is ready
    setTimeout(() => {
      openAddFeedbackModal(serviceId, customerId);
    }, 500);
  }
});

// Open feedback modal from URL parameters
function openAddFeedbackModalFromURL() {
  const serviceId = getQueryParam('serviceId');
  const customerId = getQueryParam('customerId');
  if (serviceId && customerId) {
    openAddFeedbackModal(serviceId, customerId);
  } else {
    showAlert('Service ID and Customer ID are required', 'error');
  }
}

// Load all feedback
async function loadFeedback() {
  showLoading('feedbackList');
  
  try {
    const response = await feedbackAPI.getAll();
    const feedbacks = response.data;
    displayFeedback(feedbacks);
  } catch (error) {
    document.getElementById('feedbackList').innerHTML = `
      <div class="text-center text-danger">Error loading feedback: ${error.message}</div>
    `;
  }
}

// Display feedback
function displayFeedback(feedbacks) {
  const container = document.getElementById('feedbackList');
  
  if (!feedbacks || feedbacks.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted">No feedback submitted yet</div>
    `;
    return;
  }
  
  container.innerHTML = feedbacks.map(feedback => {
    const customer = feedback.customerId || {};
    const service = feedback.serviceId || {};
    
    const stars = '★'.repeat(feedback.rating) + '☆'.repeat(5 - feedback.rating);
    
    return `
      <div style="padding: 20px; border: 1px solid var(--border-color); border-radius: 6px; margin-bottom: 15px;">
        <div class="flex-between" style="margin-bottom: 10px;">
          <div>
            <strong>${customer.name || 'Anonymous'}</strong>
            <span class="text-muted"> - ${formatDate(feedback.feedbackDate || feedback.createdAt)}</span>
          </div>
          <div style="color: #f59e0b; font-size: 18px;">${stars}</div>
        </div>
        ${feedback.comment ? `
          <div style="padding: 10px; background: var(--light-gray); border-radius: 4px; margin-top: 10px;">
            ${feedback.comment}
          </div>
        ` : ''}
        <div style="margin-top: 10px; font-size: 12px; color: var(--text-secondary);">
          Service ID: ${service._id ? service._id.toString().substring(0, 8) + '...' : 'N/A'}
        </div>
      </div>
    `;
  }).join('');
}

// Open add feedback modal
function openAddFeedbackModal(serviceId, customerId) {
  // Ensure IDs are strings, not objects
  let serviceIdStr = serviceId;
  let customerIdStr = customerId;
  
  // If they're objects, extract the _id or convert to string
  if (typeof serviceId === 'object' && serviceId !== null) {
    serviceIdStr = serviceId._id ? serviceId._id.toString() : serviceId.toString();
  } else if (serviceId) {
    serviceIdStr = serviceId.toString().trim();
  }
  
  if (typeof customerId === 'object' && customerId !== null) {
    customerIdStr = customerId._id ? customerId._id.toString() : customerId.toString();
  } else if (customerId) {
    customerIdStr = customerId.toString().trim();
  }
  
  document.getElementById('feedbackServiceId').value = serviceIdStr;
  document.getElementById('feedbackCustomerId').value = customerIdStr;
  currentRating = 0;
  updateStars();
  document.getElementById('feedbackComment').value = '';
  openModal('addFeedbackModal');
}

// Set rating
function setRating(rating) {
  currentRating = rating;
  document.getElementById('feedbackRating').value = rating;
  updateStars();
}

// Update star display
function updateStars() {
  for (let i = 1; i <= 5; i++) {
    const star = document.getElementById(`star${i}`);
    if (star) {
      star.textContent = i <= currentRating ? '★' : '☆';
      star.style.color = i <= currentRating ? '#f59e0b' : '#ccc';
    }
  }
}

// Submit feedback
async function submitFeedback() {
  try {
    const serviceIdInput = document.getElementById('feedbackServiceId');
    const customerIdInput = document.getElementById('feedbackCustomerId');
    const ratingInput = document.getElementById('feedbackRating');
    const commentInput = document.getElementById('feedbackComment');
    
    if (!serviceIdInput || !customerIdInput || !ratingInput) {
      showAlert('Missing required fields', 'error');
      return;
    }
    
    // Get values and ensure they are strings
    let serviceId = serviceIdInput.value;
    let customerId = customerIdInput.value;
    
    // If values are objects (stringified) or "[object Object]", extract ID properly
    if (serviceId && (serviceId === '[object Object]' || serviceId.includes('[object Object]'))) {
      // If it's the string "[object Object]", we need to get the actual ID from somewhere else
      // This shouldn't happen if history.js is working correctly, but handle it anyway
      console.error('ServiceId is "[object Object]" - this should not happen');
      showAlert('Invalid Service ID. Please try again.', 'error');
      return;
    } else if (serviceId) {
      serviceId = serviceId.trim();
    }
    
    if (customerId && (customerId === '[object Object]' || customerId.includes('[object Object]'))) {
      // If it's the string "[object Object]", we need to get the actual ID from somewhere else
      console.error('CustomerId is "[object Object]" - this should not happen');
      showAlert('Invalid Customer ID. Please try again.', 'error');
      return;
    } else if (customerId) {
      customerId = customerId.trim();
    }
    
    const rating = parseInt(ratingInput.value);
    const comment = commentInput ? commentInput.value.trim() : '';
    
    if (!serviceId || serviceId.length !== 24) {
      showAlert('Invalid Service ID', 'error');
      return;
    }
    
    if (!customerId || customerId.length !== 24) {
      showAlert('Invalid Customer ID', 'error');
      return;
    }
    
    if (!rating || rating < 1 || rating > 5) {
      showAlert('Please select a rating', 'error');
      return;
    }
    
    const response = await feedbackAPI.create({
      serviceId,
      customerId,
      rating,
      comment: comment
    });
    
    if (response.success) {
      showAlert('Feedback submitted successfully', 'success');
      closeModal('addFeedbackModal');
      loadFeedback();
    } else {
      throw new Error(response.error || 'Failed to submit feedback');
    }
  } catch (error) {
    showAlert('Failed to submit feedback: ' + error.message, 'error');
  }
}

