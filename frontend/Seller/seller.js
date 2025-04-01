// seller.js
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();

    // Get all modal elements
    const salesModal = document.getElementById('sales-modal');
    const bestsellerModal = document.getElementById('bestseller-modal');
    const vatModal = document.getElementById('vat-modal');
    const addProductModal = document.getElementById('add-product-modal');
    const editProductModal = document.getElementById('edit-product-modal');

    // Get all close modal buttons
    const closeButtons = document.querySelectorAll('.close-modal');
    const cancelButtons = document.querySelectorAll('.cancel-button');

    // Add event listeners to close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            salesModal.style.display = 'none';
            bestsellerModal.style.display = 'none';
            vatModal.style.display = 'none';
            addProductModal.style.display = 'none';
            editProductModal.style.display = 'none';
        });
    });

    // Add event listeners to cancel buttons
    cancelButtons.forEach(button => {
        button.addEventListener('click', () => {
            salesModal.style.display = 'none';
            bestsellerModal.style.display = 'none';
            vatModal.style.display = 'none';
            addProductModal.style.display = 'none';
            editProductModal.style.display = 'none';
        });
    });

    // Close modal when clicking outside of modal content
    window.addEventListener('click', (event) => {
        if (event.target === salesModal || 
            event.target === bestsellerModal || 
            event.target === vatModal ||
            event.target === addProductModal ||
            event.target === editProductModal) {
            salesModal.style.display = 'none';
            bestsellerModal.style.display = 'none';
            vatModal.style.display = 'none';
            addProductModal.style.display = 'none';
            editProductModal.style.display = 'none';
        }
    });

    // Add Product button click handler
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            // Clear the form
            document.getElementById('add-product-form').reset();
            // Show the modal
            addProductModal.style.display = 'block';
        });
    }

    // Add Product form submission
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const productName = document.getElementById('productName').value;
            const productPrice = document.getElementById('productPrice').value;
            const productQuantity = document.getElementById('productQuantity').value;
            const productImage = document.getElementById('productImage').value;

            // Validate input
            if (!productName || !productPrice || !productQuantity) {
                alert('Please fill in all required fields');
                return;
            }

            fetch('/seller/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productName: productName,
                    price: productPrice,
                    qty: productQuantity,
                    picURLs: productImage
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                alert(data.message);
                addProductModal.style.display = 'none';
                loadDashboardData(); // Refresh the product list
            })
            .catch(error => {
                console.error('Error adding product:', error);
                alert('Failed to add product. Please try again.');
            });
        });
    }

    // Edit Product form submission
    const editProductForm = document.getElementById('edit-product-form');
    if (editProductForm) {
        editProductForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const productId = document.getElementById('edit-product-id').value;
            const productName = document.getElementById('edit-productName').value;
            const productPrice = document.getElementById('edit-productPrice').value;
            const productQuantity = document.getElementById('edit-productQuantity').value;
            const productImage = document.getElementById('edit-productImage').value;

            // Validate input
            if (!productId || !productName || !productPrice || !productQuantity) {
                alert('Please fill in all required fields');
                return;
            }

            fetch(`/seller/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productName: productName,
                    productPrice: productPrice,
                    productQuantity: productQuantity,
                    productImage: productImage
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                alert(data.message);
                editProductModal.style.display = 'none';
                loadDashboardData(); // Refresh the product list
            })
            .catch(error => {
                console.error('Error updating product:', error);
                alert('Failed to update product. Please try again.');
            });
        });
    }

    function loadDashboardData() {
        fetch('/seller/dashboard-data')
            .then(response => response.json())
            .then(data => {
                document.getElementById('total-sales-value').textContent = '฿' + data.totalSales;
                document.getElementById('best-seller-value').textContent = data.bestSeller;
                document.getElementById('vat-value').textContent = '฿' + data.vatAmount;

                const productTableBody = document.getElementById('product-table-body');
                productTableBody.innerHTML = '';

                data.products.forEach(product => {
                    const row = productTableBody.insertRow();
                    row.setAttribute('data-product-id', product.ID);

                    row.insertCell().textContent = product.ID;

                    // [เพิ่ม Column รูปภาพ]
                    const imageCell = row.insertCell();
                    const productImage = document.createElement('img');
                    productImage.src = product.Image || 'placeholder.jpg'; // Fallback to placeholder if no image
                    productImage.style.width = '50px';
                    productImage.style.height = '50px';
                    imageCell.appendChild(productImage);

                    row.insertCell().textContent = product.Name;
                    row.insertCell().textContent = product.Price;
                    row.insertCell().textContent = product.Quantity;

                    const actionsCell = row.insertCell();
                    actionsCell.innerHTML = `
                        <button class="edit-btn" onclick="editProduct(${product.ID})">Edit</button>
                        <button class="delete-btn" onclick="deleteProduct(${product.ID})">Delete</button>
                    `;
                });
            })
            .catch(error => {
                console.error('Error fetching dashboard data:', error);
            });
    }

    window.editProduct = function(productId) {
        // Fetch product data
        fetch(`/seller/products/${productId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(productData => {
                // Fill in the form with product data
                document.getElementById('edit-product-id').value = productId;
                document.getElementById('edit-productName').value = productData.productName;
                document.getElementById('edit-productPrice').value = productData.price;
                document.getElementById('edit-productQuantity').value = productData.qty;
                document.getElementById('edit-productImage').value = productData.picURLs || '';

                // Show the modal
                editProductModal.style.display = 'block';
            })
            .catch(error => {
                console.error('Error fetching product details:', error);
                alert('Failed to load product details. Please try again.');
            });
    };

    window.deleteProduct = function(productId) {
        const confirmDelete = confirm(`Are you sure you want to delete product ID: ${productId}?`);
        if (confirmDelete) {
            fetch(`/seller/products/${productId}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    console.log(`Product ID ${productId} deleted successfully.`);
                    const productRow = document.querySelector(
                        `#product-table-body tr[data-product-id="${productId}"]`
                    );
                    if (productRow) {
                        productRow.remove();
                    } else {
                        console.warn(`Product row with ID ${productId} not found in table.`);
                    }
                } else {
                    console.error(`Failed to delete product ID ${productId}. Status: ${response.status}`);
                    alert(`Failed to delete product. Please try again. Status: ${response.status}`);
                }
            })
            .catch(error => {
                console.error('Error deleting product:', error);
                alert('Error deleting product. Please check console.');
            });
        } else {
            console.log(`Delete product ID ${productId} cancelled by user.`);
        }
    };

    window.showSalesDetails = function() {
        // Calculate total from sales table
        let total = 0;
        const salesRows = document.querySelectorAll('.sales-table tbody tr');
        salesRows.forEach(row => {
            const amountText = row.querySelector('.amount-column').textContent;
            const amount = parseFloat(amountText.replace('฿', '').replace(',', ''));
            total += amount;
        });
        
        document.getElementById('modal-total-sales').textContent = `฿${total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        
        // Show the modal
        salesModal.style.display = 'block';
    };

    window.showBestSellerDetails = function() {
        // Get best seller info and update modal content
        const bestSellerText = document.getElementById('best-seller-value').textContent;
        document.getElementById('modal-best-seller-title').textContent = bestSellerText;
        
        // For demo purposes, set some sample values
        document.getElementById('modal-units-sold').textContent = '100';
        document.getElementById('modal-best-seller-revenue').textContent = '฿3,500.00';
        
        // Show the modal
        bestsellerModal.style.display = 'block';
    };

    window.showTaxDetails = function() {
        // Get VAT info and update modal content
        const totalSalesText = document.getElementById('total-sales-value').textContent;
        const vatAmountText = document.getElementById('vat-value').textContent;
        
        document.getElementById('modal-vat-total-sales').textContent = totalSalesText;
        document.getElementById('modal-vat-amount').textContent = vatAmountText;
        
        // Show the modal
        vatModal.style.display = 'block';
    };

    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            console.log('Logout button clicked!');
            localStorage.removeItem('user');
            
            fetch('/seller/logout', {
                method: 'POST'
            })
            .then(response => {
                if (response.ok) {
                    window.location.href = '/index.html';
                } else {
                    alert('Logout failed. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error calling logout API:', error);
                alert('Logout failed due to network error.');
            });
        });
    }
});