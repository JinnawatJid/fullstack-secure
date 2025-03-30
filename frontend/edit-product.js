document.addEventListener('DOMContentLoaded', () => {
    // Get productID from URL Query Parameter
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        document.getElementById('product-id-display').textContent = productId;

        // Fetch product data from Backend API
        fetch(`/seller/products/${productId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(productData => {
                // Fill in the form with product data
                document.getElementById('productName').value = productData.productName;
                document.getElementById('productPrice').value = productData.price;
                document.getElementById('productQuantity').value = productData.qty;
                document.getElementById('productImage').value = productData.picURLs || '';
            })
            .catch(error => {
                console.error('Error fetching product details:', error);
                alert('Failed to load product details. Please try again.');
                window.location.href = '/seller.html';
            });
    } else {
        alert('Product ID is missing.');
        window.location.href = '/seller.html';
    }

    // Handle form submission
    const editProductForm = document.getElementById('edit-product-form');
    editProductForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // Get form data
        const productName = document.getElementById('productName').value;
        const productPrice = document.getElementById('productPrice').value;
        const productQuantity = document.getElementById('productQuantity').value;
        const productImage = document.getElementById('productImage').value;

        // Call API to update product (match parameter names with what server.js expects)
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
            window.location.href = '/seller.html';
        })
        .catch(error => {
            console.error('Error updating product:', error);
            alert('Failed to update product. Please try again.');
        });
    });
});