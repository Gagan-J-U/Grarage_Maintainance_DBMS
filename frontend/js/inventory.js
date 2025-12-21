// frontend/js/inventory.js

// Load parts on page load
document.addEventListener('DOMContentLoaded', () => {
  loadParts();
});

// Load parts with filters
async function loadParts() {
  showLoading('partsTableBody');
  
  try {
    const filters = {};
    const category = document.getElementById('categoryFilter').value;
    const lowStock = document.getElementById('lowStockFilter').value;
    const search = document.getElementById('partSearch').value.trim();
    
    if (category) filters.category = category;
    if (lowStock === 'true') filters.lowStock = 'true';
    
    let response;
    if (search.length >= 2) {
      response = await partsAPI.search(search);
    } else {
      response = await partsAPI.getAll(filters);
    }
    
    const parts = response.data;
    displayParts(parts);
  } catch (error) {
    document.getElementById('partsTableBody').innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-danger">Error loading parts: ${error.message}</td>
      </tr>
    `;
  }
}

// Display parts in table
function displayParts(parts) {
  const tbody = document.getElementById('partsTableBody');
  
  if (!parts || parts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted">No parts found</td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = parts.map(part => {
    const stockClass = part.quantityAvailable <= part.reorderLevel ? 'text-danger' : '';
    return `
      <tr>
        <td>${part.partName}</td>
        <td>${part.partNumber}</td>
        <td>${part.category}</td>
        <td>${formatCurrency(part.price)}</td>
        <td class="${stockClass}">${part.quantityAvailable}</td>
        <td>${part.reorderLevel || 5}</td>
        <td>
          <button onclick="openEditPartModal('${part._id}')" class="btn btn-sm btn-primary">Edit</button>
          <button onclick="openUpdateQuantityModal('${part._id}')" class="btn btn-sm btn-secondary">Update Stock</button>
          <button onclick="deletePart('${part._id}')" class="btn btn-sm btn-danger">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Open add part modal
function openAddPartModal() {
  document.getElementById('modalTitle').textContent = 'Add New Part';
  document.getElementById('partForm').reset();
  document.getElementById('partId').value = '';
  openModal('addPartModal');
}

// Open edit part modal
async function openEditPartModal(partId) {
  try {
    const response = await partsAPI.getById(partId);
    const part = response.data;
    
    document.getElementById('modalTitle').textContent = 'Edit Part';
    document.getElementById('partId').value = part._id;
    document.getElementById('partName').value = part.partName;
    document.getElementById('partNumber').value = part.partNumber;
    document.getElementById('partCategory').value = part.category;
    document.getElementById('partPrice').value = part.price;
    document.getElementById('partQuantity').value = part.quantityAvailable;
    document.getElementById('reorderLevel').value = part.reorderLevel || 5;
    document.getElementById('supplier').value = part.supplier || '';
    
    openModal('addPartModal');
  } catch (error) {
    showAlert('Failed to load part: ' + error.message, 'error');
  }
}

// Save part
async function savePart() {
  try {
    const partId = document.getElementById('partId').value;
    const partData = {
      partName: document.getElementById('partName').value.trim(),
      partNumber: document.getElementById('partNumber').value.trim().toUpperCase(),
      category: document.getElementById('partCategory').value,
      price: parseFloat(document.getElementById('partPrice').value),
      quantityAvailable: parseInt(document.getElementById('partQuantity').value),
      reorderLevel: parseInt(document.getElementById('reorderLevel').value) || 5,
      supplier: document.getElementById('supplier').value.trim()
    };
    
    if (partId) {
      await partsAPI.update(partId, partData);
      showAlert('Part updated successfully', 'success');
    } else {
      await partsAPI.create(partData);
      showAlert('Part created successfully', 'success');
    }
    
    closeModal('addPartModal');
    loadParts();
  } catch (error) {
    showAlert('Failed to save part: ' + error.message, 'error');
  }
}

// Open update quantity modal
function openUpdateQuantityModal(partId) {
  document.getElementById('updatePartId').value = partId;
  document.getElementById('updateQuantity').value = 1;
  document.getElementById('quantityOperation').value = 'add';
  openModal('updateQuantityModal');
}

// Update quantity
async function updateQuantity() {
  try {
    const partId = document.getElementById('updatePartId').value;
    const quantity = parseInt(document.getElementById('updateQuantity').value);
    const operation = document.getElementById('quantityOperation').value;
    
    await partsAPI.updateQuantity({
      partId,
      quantity,
      operation
    });
    
    showAlert('Stock updated successfully', 'success');
    closeModal('updateQuantityModal');
    loadParts();
  } catch (error) {
    showAlert('Failed to update stock: ' + error.message, 'error');
  }
}

// Delete part
async function deletePart(partId) {
  if (!confirmAction('Are you sure you want to delete this part?')) {
    return;
  }
  
  try {
    await partsAPI.delete(partId);
    showAlert('Part deleted successfully', 'success');
    loadParts();
  } catch (error) {
    showAlert('Failed to delete part: ' + error.message, 'error');
  }
}


