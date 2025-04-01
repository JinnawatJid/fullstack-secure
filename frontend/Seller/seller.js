document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();

    const addProductModal = document.getElementById('add-product-modal');
    const editProductModal = document.getElementById('edit-product-modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    const cancelButtons = document.querySelectorAll('.cancel-button');

    // Close modals with a single function
    const closeModals = () => {
        addProductModal.style.display = 'none';
        editProductModal.style.display = 'none';
    };

    closeButtons.forEach(button => button.addEventListener('click', closeModals));
    cancelButtons.forEach(button => button.addEventListener('click', closeModals));
    window.addEventListener('click', (event) => {
        if (event.target === addProductModal || event.target === editProductModal) {
            closeModals();
        }
    });

    // Add Product button
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            document.getElementById('add-product-form').reset();
            addProductModal.style.display = 'block';
        });
    }

    // Add Product form submission
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const productName = document.getElementById('productName').value;
            const productPrice = document.getElementById('productPrice').value;
            const productQuantity = document.getElementById('productQuantity').value;
            const productImage = document.getElementById('productImage').value;

            if (!productName || !productPrice || !productQuantity) {
                alert('Please fill in all required fields');
                return;
            }

            try {
                const response = await fetch('/seller/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productName, price: productPrice, qty: productQuantity, picURLs: productImage })
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();

                alert(data.message);
                addProductModal.style.display = 'none';
                loadDashboardData();
            } catch (error) {
                console.error('Error adding product:', error);
                alert('Failed to add product. Please try again.');
            }
        });
    }

    // Edit Product form submission
    const editProductForm = document.getElementById('edit-product-form');
    if (editProductForm) {
        editProductForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const productId = document.getElementById('edit-product-id').value;
            const productName = document.getElementById('edit-productName').value;
            const productPrice = document.getElementById('edit-productPrice').value;
            const productQuantity = document.getElementById('edit-productQuantity').value;
            const productImage = document.getElementById('edit-productImage').value;

            if (!productId || !productName || !productPrice || !productQuantity) {
                alert('Please fill in all required fields');
                return;
            }

            try {
                const response = await fetch(`/seller/products/${productId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productName, productPrice, productQuantity, productImage })
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();

                alert(data.message);
                editProductModal.style.display = 'none';
                loadDashboardData();
            } catch (error) {
                console.error('Error updating product:', error);
                alert('Failed to update product. Please try again.');
            }
        });
    }

    // Load dashboard data
    function loadDashboardData() {
        fetch('/seller/dashboard-data')
            .then(response => response.json())
            .then(data => {
                document.getElementById('total-sales-value').textContent = `฿${data.totalSales}`;
                document.getElementById('best-seller-value').textContent = data.bestSeller;
                document.getElementById('vat-value').textContent = `฿${data.vatAmount}`;
    
                const productTableBody = document.getElementById('product-table-body');
                productTableBody.innerHTML = '';
    
                data.products.forEach(product => {
                    const row = productTableBody.insertRow();
                    row.setAttribute('data-product-id', product.ID);
    
                    row.insertCell().textContent = product.ID;
    
                    const imageCell = row.insertCell();
                    const productImage = document.createElement('img');
                    // Sanitize URL
                    const imageUrl = product.Image || 'placeholder.jpg';
                    // Only allow http/https URLs or relative paths
                    if (imageUrl.match(/^(https?:\/\/|\/)/)) {
                        productImage.src = imageUrl;
                    } else {
                        productImage.src = 'placeholder.jpg';
                    }
                    productImage.style.width = '50px';
                    productImage.style.height = '50px';
                    imageCell.appendChild(productImage);
    
                    row.insertCell().textContent = product.Name;
                    row.insertCell().textContent = product.Price;
                    row.insertCell().textContent = product.Quantity;
    
                    // Create action buttons safely
                    const actionsCell = row.insertCell();
                    
                    const editBtn = document.createElement('button');
                    editBtn.className = 'edit-btn';
                    editBtn.textContent = 'Edit';
                    editBtn.addEventListener('click', () => editProduct(product.ID));
                    
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-btn';
                    deleteBtn.textContent = 'Delete';
                    deleteBtn.addEventListener('click', () => deleteProduct(product.ID));
                    
                    actionsCell.appendChild(editBtn);
                    actionsCell.appendChild(deleteBtn);
                });
            })
            .catch(error => console.error('Error fetching dashboard data:', error));
    }
    // Edit product
    window.editProduct = async (productId) => {
        try {
            const response = await fetch(`/seller/products/${productId}`);
            const productData = await response.json();

            document.getElementById('edit-product-id').value = productId;
            document.getElementById('edit-productName').value = productData.productName;
            document.getElementById('edit-productPrice').value = productData.price;
            document.getElementById('edit-productQuantity').value = productData.qty;
            document.getElementById('edit-productImage').value = productData.picURLs || '';

            editProductModal.style.display = 'block';
        } catch (error) {
            console.error('Error fetching product details:', error);
            alert('Failed to load product details. Please try again.');
        }
    };

    // Delete product
    window.deleteProduct = async (productId) => {
        if (!confirm(`Are you sure you want to delete product ID: ${productId}?`)) return;

        try {
            const response = await fetch(`/seller/products/${productId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const productRow = document.querySelector(`#product-table-body tr[data-product-id="${productId}"]`);
            if (productRow) productRow.remove();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product. Please try again.');
        }
    };

    // Logout
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            localStorage.removeItem('user');
            try {
                const response = await fetch('/seller/logout', { method: 'POST' });
                if (response.ok) {
                    window.location.href = '/index.html';
                } else {
                    alert('Logout failed. Please try again.');
                }
            } catch (error) {
                console.error('Error calling logout API:', error);
                alert('Logout failed due to network error.');
            }
        });
    }
});