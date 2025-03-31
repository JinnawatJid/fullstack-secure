document.addEventListener('DOMContentLoaded', () => {
    // Get CSRF token from meta tag
    function getCSRFToken() {
        const tokenElement = document.querySelector('meta[name="csrf-token"]');
        return tokenElement ? tokenElement.getAttribute('content') : '';
    }
    
    // Display username securely
    const user = JSON.parse(localStorage.getItem('user'));
    const usernameDisplay = document.getElementById('username-display');
    if (user && user.email && usernameDisplay) {
        // Sanitize the email before displaying
        const sanitizedEmail = document.createElement('div');
        sanitizedEmail.textContent = user.email;
        usernameDisplay.textContent = sanitizedEmail.innerHTML;
    }
    
    // Handle product form submission
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(event) {
            event.preventDefault();

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
            
            fetch('/api/seller/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
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
                window.location.href = '/seller.html';
            })
            .catch(error => {
                console.error('Error adding product:', error);
                alert('Failed to add product. Please try again.');
            });
        });
    }
});