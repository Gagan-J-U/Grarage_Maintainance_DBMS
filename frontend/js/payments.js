// frontend/js/payments.js

// Load payments on page load
document.addEventListener('DOMContentLoaded', () => {
  loadPayments();
});

// Load payments with filters
async function loadPayments() {
  showLoading('paymentsTableBody');
  
  try {
    const filters = {};
    const status = document.getElementById('statusFilter').value;
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    
    if (status) filters.status = status;
    if (dateFrom) filters.startDate = dateFrom;
    if (dateTo) filters.endDate = dateTo;
    
    const response = await paymentAPI.getAll(filters);
    
    if (response.success && response.data) {
      displayPayments(response.data);
    } else {
      throw new Error(response.error || 'Failed to load payments');
    }
  } catch (error) {
    console.error('Error loading payments:', error);
    document.getElementById('paymentsTableBody').innerHTML = `
      <tr>
        <td colspan="10" class="text-center text-danger">Error loading payments: ${error.message}</td>
      </tr>
    `;
  }
}

// Display payments in table
function displayPayments(payments) {
  const tbody = document.getElementById('paymentsTableBody');
  
  if (!payments || payments.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="text-center text-muted">No payments found</td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = payments.map(payment => {
    const customer = payment.customerId || {};
    const vehicle = payment.vehicleId || {};
    const service = payment.serviceId || {};
    const serviceIdStr = service && service._id ? service._id.toString() : (payment.serviceId ? payment.serviceId.toString() : 'N/A');
    
    return `
      <tr>
        <td>${serviceIdStr !== 'N/A' ? serviceIdStr.substring(0, 8) + '...' : 'N/A'}</td>
        <td>${customer.name || 'N/A'}</td>
        <td>${vehicle.vehicleNumber || 'N/A'}</td>
        <td>${formatCurrency(payment.totalAmount || 0)}</td>
        <td>${formatCurrency(payment.paidAmount || 0)}</td>
        <td>${formatCurrency(payment.balanceAmount || payment.totalAmount || 0)}</td>
        <td>${payment.paymentMode || 'Not Set'}</td>
        <td><span class="badge ${getStatusBadgeClass(payment.paymentStatus)}">${payment.paymentStatus}</span></td>
        <td>${formatDate(payment.paymentDate || payment.createdAt)}</td>
        <td>
          ${payment.paymentStatus !== 'Paid' ? `<button onclick="openProcessPaymentModal('${payment._id}')" class="btn btn-sm btn-primary">Process</button>` : ''}
          <button onclick="viewBill('${payment._id}')" class="btn btn-sm btn-secondary">View Bill</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Open process payment modal
async function openProcessPaymentModal(paymentId) {
  try {
    const response = await paymentAPI.getById(paymentId);
    const payment = response.data;
    
    document.getElementById('paymentId').value = payment._id;
    document.getElementById('paidAmount').value = payment.totalAmount - payment.paidAmount;
    
    const customer = payment.customerId || {};
    const vehicle = payment.vehicleId || {};
    
    document.getElementById('paymentDetails').innerHTML = `
      <div><strong>Customer:</strong> ${customer.name || 'N/A'}</div>
      <div><strong>Vehicle:</strong> ${vehicle.vehicleNumber || 'N/A'}</div>
      <div><strong>Total Amount:</strong> ${formatCurrency(payment.totalAmount)}</div>
      <div><strong>Already Paid:</strong> ${formatCurrency(payment.paidAmount)}</div>
      <div><strong>Balance:</strong> ${formatCurrency(payment.balanceAmount)}</div>
    `;
    
    openModal('processPaymentModal');
  } catch (error) {
    showAlert('Failed to load payment: ' + error.message, 'error');
  }
}

// Process payment
async function processPayment() {
  try {
    const paymentId = document.getElementById('paymentId').value;
    const paymentMode = document.getElementById('paymentMode').value;
    const paidAmount = parseFloat(document.getElementById('paidAmount').value);
    const transactionId = document.getElementById('transactionId').value.trim();
    
    if (!paymentMode) {
      showAlert('Please select payment mode', 'error');
      return;
    }
    
    await paymentAPI.process({
      paymentId,
      paymentMode,
      paidAmount,
      transactionId: transactionId || undefined
    });
    
    showAlert('Payment processed successfully', 'success');
    closeModal('processPaymentModal');
    loadPayments();
  } catch (error) {
    showAlert('Failed to process payment: ' + error.message, 'error');
  }
}

// View bill
async function viewBill(paymentId) {
  try {
    const response = await paymentAPI.getById(paymentId);
    const payment = response.data;
    
    const customer = payment.customerId || {};
    const vehicle = payment.vehicleId || {};
    const service = payment.serviceId || {};
    
    const billHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h2>GARAGE MANAGEMENT SYSTEM</h2>
        <p>Payment Bill</p>
      </div>
      <div style="margin-bottom: 20px;">
        <div><strong>Bill No:</strong> ${payment._id.toString().substring(0, 8).toUpperCase()}</div>
        <div><strong>Date:</strong> ${formatDate(payment.paymentDate || payment.createdAt)}</div>
      </div>
      <div style="margin-bottom: 20px; padding: 15px; background: var(--light-gray); border-radius: 6px;">
        <div><strong>Customer Name:</strong> ${customer.name || 'N/A'}</div>
        <div><strong>Phone:</strong> ${customer.phone || 'N/A'}</div>
        <div><strong>Vehicle:</strong> ${vehicle.vehicleNumber || 'N/A'} (${vehicle.vehicleType || ''})</div>
      </div>
      <table style="width: 100%; margin-bottom: 20px;">
        <thead>
          <tr style="background: var(--light-gray);">
            <th style="padding: 10px; text-align: left;">Description</th>
            <th style="padding: 10px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 10px;">Parts Cost</td>
            <td style="padding: 10px; text-align: right;">${formatCurrency(payment.partsCost)}</td>
          </tr>
          <tr>
            <td style="padding: 10px;">Labor Cost</td>
            <td style="padding: 10px; text-align: right;">${formatCurrency(payment.laborCost)}</td>
          </tr>
          ${payment.extraCharges > 0 ? `
          <tr>
            <td style="padding: 10px;">Extra Charges</td>
            <td style="padding: 10px; text-align: right;">${formatCurrency(payment.extraCharges)}</td>
          </tr>
          ` : ''}
          <tr style="border-top: 2px solid var(--border-color);">
            <td style="padding: 10px; font-weight: 600;">Total Amount</td>
            <td style="padding: 10px; text-align: right; font-weight: 600;">${formatCurrency(payment.totalAmount)}</td>
          </tr>
          <tr>
            <td style="padding: 10px;">Paid Amount</td>
            <td style="padding: 10px; text-align: right;">${formatCurrency(payment.paidAmount)}</td>
          </tr>
          ${payment.balanceAmount > 0 ? `
          <tr>
            <td style="padding: 10px;">Balance</td>
            <td style="padding: 10px; text-align: right; color: var(--danger-color);">${formatCurrency(payment.balanceAmount)}</td>
          </tr>
          ` : ''}
        </tbody>
      </table>
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border-color);">
        <div><strong>Payment Mode:</strong> ${payment.paymentMode || 'N/A'}</div>
        ${payment.transactionId ? `<div><strong>Transaction ID:</strong> ${payment.transactionId}</div>` : ''}
        <div><strong>Status:</strong> <span class="badge ${getStatusBadgeClass(payment.paymentStatus)}">${payment.paymentStatus}</span></div>
      </div>
    `;
    
    document.getElementById('billContent').innerHTML = billHTML;
    openModal('billModal');
  } catch (error) {
    showAlert('Failed to load bill: ' + error.message, 'error');
  }
}

