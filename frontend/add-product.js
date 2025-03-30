document.addEventListener('DOMContentLoaded', () => {
    // Display username from localStorage if available
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.email) {
        document.getElementById('username-display').textContent = user.email;
    }
    
    // Handle product form submission
    const addProductForm = document.getElementById('add-product-form');
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
            fetch('/seller/logout', {
                method: 'POST'
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