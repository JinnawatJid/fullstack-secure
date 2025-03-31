// frontend/js/edit-product.js (updated)
document.addEventListener('DOMContentLoaded', () => {
    // Get CSRF token from meta tag
    function getCSRFToken() {
        const tokenElement = document.querySelector('meta[name="csrf-token"]');
        return tokenElement ? tokenElement.getAttribute('content') : '';
    }
    
    // Sanitize URL parameters
    function getValidatedProductId() {
        const urlParams = new URLSearchParams(window.location.search);
        const rawProductId = urlParams.get('id');
        
        // Validate product ID is numeric
        if (rawProductId && /^\d+$/.test(rawProductId)) {
            return rawProductId;
        }
        return null;
    }
    
    const productId = getValidatedProductId();
    const productIdDisplay = document.getElementById('product-id-display');
    
    if (productId && productIdDisplay) {
        productIdDisplay.textContent = productId;

        // Fetch product data from Backend API
        fetch(`/api/seller/products/${encodeURIComponent(productId)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(productData => {
                // Safely fill in the form with product data
                if (document.getElementById('productName')) {
                    document.getElementById('productName').value = productData.productName || '';
                }
                if (document.getElementById('productPrice')) {
                    document.getElementById('productPrice').value = productData.price || '';
                }
                if (document.getElementById('productQuantity')) {
                    document.getElementById('productQuantity').value = productData.qty || '';
                }
                if (document.getElementById('productImage')) {
                    document.getElementById('productImage').value = productData.picURLs || '';
                }
            })
            .catch(error => {
                console.error('Error fetching product details:', error);
                alert('Failed to load product details. Please try again.');
                window.location.href = '/seller.html';
            });
    } else {
        alert('Invalid Product ID.');
        window.location.href = '/seller.html';
    }

    // Handle form submission
    const editProductForm = document.getElementById('edit-product-form');
    if (editProductForm) {
        editProductForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Get form data
            const productName = document.getElementById('productName').value.trim();
            const productPrice = document.getElementById('productPrice').value.trim();
            const productQuantity = document.getElementById('productQuantity').value.trim();
            const productImage = document.getElementById('productImage').value.trim();

            // Validate input
            if (!productName || !productPrice || !productQuantity) {
                alert('Please fill in all required fields');
                return;
            }

            const csrfToken = getCSRFToken();
            
            // Call API to update product
            fetch(`/api/seller/products/${encodeURIComponent(productId)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
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
                window.location.href = '/seller.html';
            })
            .catch(error => {
                console.error('Error updating product:', error);
                alert('Failed to update product. Please try again.');
            });
        });
    }
});