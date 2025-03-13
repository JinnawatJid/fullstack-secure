// add-product.js
document.addEventListener('DOMContentLoaded', () => {
    // Display username from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.email) {
        document.getElementById('username-display').textContent = user.email;
    }
    
    const addProductForm = document.getElementById('add-product-form');
    addProductForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const productName = document.getElementById('productName').value;
        const productPrice = document.getElementById('productPrice').value;
        const productQuantity = document.getElementById('productQuantity').value;
        const productImage = document.getElementById('productImage').value;

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
            window.location.href = '/seller.html';
        })
        .catch(error => {
            console.error('Error adding product:', error);
            alert('Failed to add product. Please try again.');
        });
    });
    
    // Logout functionality
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('user');
            window.location.href = '/index.html';
        });
    }
});