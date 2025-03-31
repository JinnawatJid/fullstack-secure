document.addEventListener('DOMContentLoaded', () => {
    // Get CSRF token from header
    function getCSRFToken() {
        const tokenElement = document.querySelector('meta[name="csrf-token"]');
        return tokenElement ? tokenElement.getAttribute('content') : '';
    }

    // Update CSRF token
    async function updateCSRFToken() {
        try {
            const response = await fetch('/csrf-token');
            const data = await response.json();
            
            const metaElement = document.querySelector('meta[name="csrf-token"]');
            if (metaElement) {
                metaElement.setAttribute('content', data.csrfToken);
            } else {
                const newMetaElement = document.createElement('meta');
                newMetaElement.setAttribute('name', 'csrf-token');
                newMetaElement.setAttribute('content', data.csrfToken);
                document.head.appendChild(newMetaElement);
            }

            // Also update hidden CSRF inputs if they exist
            const csrfInputs = document.querySelectorAll('input[name="_csrf"]');
            csrfInputs.forEach(input => {
                input.value = data.csrfToken;
            });
        } catch (error) {
            console.error('Error fetching CSRF token:', error);
        }
    }

    // Helper to safely sanitize HTML content
    function sanitizeHTML(text) {
        const element = document.createElement('div');
        element.textContent = text;
        return element.innerHTML;
    }

    // Helper to properly escape HTML attributes
    function escapeAttribute(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function loadDashboardData() {
        fetch('/api/seller/dashboard-data')
            .then(response => response.json())
            .then(data => {
                // Update dashboard metrics with sanitized data
                document.getElementById('total-sales-value').textContent = '฿' + sanitizeHTML(data.totalSales);
                document.getElementById('best-seller-value').textContent = sanitizeHTML(data.bestSeller);
                document.getElementById('vat-value').textContent = '฿' + sanitizeHTML(data.vatAmount);

                const productTableBody = document.getElementById('product-table-body');
                productTableBody.innerHTML = '';

                data.products.forEach(product => {
                    // Create row safely
                    const row = document.createElement('tr');
                    row.setAttribute('data-product-id', product.ID);
                    
                    // ID cell
                    const idCell = document.createElement('td');
                    idCell.textContent = product.ID;
                    row.appendChild(idCell);
                    
                    // Image cell - sanitize URL
                    const imageCell = document.createElement('td');
                    const productImage = document.createElement('img');
                    // Validate image URL
                    if (product.Image && /^https?:\/\/[^\s/$.?#].[^\s]*$/.test(product.Image)) {
                        productImage.src = product.Image;
                    } else {
                        productImage.src = '/images/placeholder.png'; // Fallback image
                    }
                    productImage.alt = 'Product Image';
                    productImage.style.width = '50px';
                    productImage.style.height = '50px';
                    imageCell.appendChild(productImage);
                    row.appendChild(imageCell);
                    
                    // Name, Price, Quantity cells
                    ['Name', 'Price', 'Quantity'].forEach(prop => {
                        const cell = document.createElement('td');
                        cell.textContent = product[prop];
                        row.appendChild(cell);
                    });
                    
                    // Actions cell
                    const actionsCell = document.createElement('td');
                    
                    // Edit button - avoid inline JS using event listeners
                    const editButton = document.createElement('button');
                    editButton.className = 'edit-btn';
                    editButton.textContent = 'Edit';
                    editButton.dataset.productId = product.ID;
                    editButton.addEventListener('click', () => editProduct(product.ID));
                    actionsCell.appendChild(editButton);
                    
                    // Delete button - avoid inline JS
                    const deleteButton = document.createElement('button');
                    deleteButton.className = 'delete-btn';
                    deleteButton.textContent = 'Delete';
                    deleteButton.dataset.productId = product.ID;
                    deleteButton.addEventListener('click', () => deleteProduct(product.ID));
                    actionsCell.appendChild(deleteButton);
                    
                    row.appendChild(actionsCell);
                    productTableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.error('Error fetching dashboard data:', error);
            });
    }

    window.editProduct = function(productId) {
        window.location.href = `/edit-product.html?id=${encodeURIComponent(productId)}`;
    };

    window.deleteProduct = function(productId) {
        const confirmDelete = confirm(`Are you sure you want to delete product ID: ${productId}?`);
        if (confirmDelete) {
            const csrfToken = getCSRFToken();
            
            fetch(`/api/seller/products/${encodeURIComponent(productId)}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify({
                    _csrf: csrfToken
                })
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            })
            .then(data => {
                console.log(data.message);
                const productRow = document.querySelector(
                    `#product-table-body tr[data-product-id="${productId}"]`
                );
                if (productRow) {
                    productRow.remove();
                }
            })
            .catch(error => {
                console.error('Error deleting product:', error);
                alert('Error deleting product. Please try again.');
            });
        }
    };

    // Initial load of dashboard data and update CSRF token
    updateCSRFToken().then(() => {
        loadDashboardData();
    });

    // Add event listeners
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            window.location.href = '/add-product.html';
        });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            const csrfToken = getCSRFToken();
            
            fetch('/api/seller/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify({
                    _csrf: csrfToken
                })
            })
            .then(response => {
                if (response.ok) {
                    localStorage.removeItem('user');
                    window.location.href = '/index.html';
                } else {
                    alert('Logout failed. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error during logout:', error);
                alert('Logout failed due to network error.');
            });
        });
    }
});
