// frontend/js/feedback.js

let currentRating = 0;

// Load feedback on page load
document.addEventListener('DOMContentLoaded', () => {
  loadFeedback();
  
  // Check if service ID is in URL for adding feedback
  const serviceId = getQueryParam('serviceId');
  const customerId = getQueryParam('customerId');
  if (serviceId && customerId) {
    openAddFeedbackModal(serviceId, customerId);
  }
});

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
  document.getElementById('feedbackServiceId').value = serviceId;
  document.getElementById('feedbackCustomerId').value = customerId;
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
    const serviceId = document.getElementById('feedbackServiceId').value;
    const customerId = document.getElementById('feedbackCustomerId').value;
    const rating = parseInt(document.getElementById('feedbackRating').value);
    const comment = document.getElementById('feedbackComment').value.trim();
    
    if (!rating || rating < 1 || rating > 5) {
      showAlert('Please select a rating', 'error');
      return;
    }
    
    await feedbackAPI.create({
      serviceId,
      customerId,
      rating,
      comments: comment
    });
    
    showAlert('Feedback submitted successfully', 'success');
    closeModal('addFeedbackModal');
    loadFeedback();
  } catch (error) {
    showAlert('Failed to submit feedback: ' + error.message, 'error');
  }
}

