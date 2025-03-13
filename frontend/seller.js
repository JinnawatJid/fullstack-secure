// seller.js
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();

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

                    // *** [เพิ่ม Column รูปภาพ] ***
                    const imageCell = row.insertCell();
                    const productImage = document.createElement('img');
                    productImage.src = product.Image;
                    productImage.style.width = '50px';
                    productImage.style.height = '50px';
                    imageCell.appendChild(productImage);
                    // *** [จบส่วนเพิ่ม Column รูปภาพ] ***

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
        // *** [แก้ไขฟังก์ชัน editProduct] ***
        window.location.href = `/edit-product.html?id=${productId}`;
        // Redirect ไปหน้า edit-product.html พร้อมส่ง productID เป็น query parameter
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

    window.openAddProductModal = function() {
        alert('Open Add Product Modal');
    };

    window.closeModal = function() {
        alert('Close Modal');
    };

    window.closeSalesModal = function() {
        alert('Close Sales Modal');
    };

    window.showSalesDetails = function() {
        alert('Show Sales Details Modal');
    };

    window.showBestSellerDetails = function() {
        alert('Show Best Seller Details');
    };

    window.showTaxDetails = function() {
        alert('Show Tax Details');
    };

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            console.log('Logout button clicked!');
            console.log('Performing logout actions...');
            localStorage.removeItem('authToken');
            console.log('authToken removed from localStorage (if existed).');
            document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            console.log('authToken cookie removed (if existed).');

            fetch('/seller/logout', {
                method: 'POST'
            })
            .then(response => {
                if (response.ok) {
                    console.log('Backend logout API call successful.');
                    window.location.href = '/index.html';
                    console.log('Redirecting to index.html (Login Page).');
                } else {
                    console.error('Logout failed on backend');
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