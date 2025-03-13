document.addEventListener('DOMContentLoaded', () => {
    // *** ดึง productID จาก URL Query Parameter ***
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        document.getElementById('product-id-display').textContent = productId;

        // *** ดึงข้อมูลสินค้าจาก Backend API ***
        fetch(`/seller/products/${productId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(productData => {
                // *** นำข้อมูลสินค้าใส่ใน Form ***
                document.getElementById('productName').value = productData.productName;
                document.getElementById('productPrice').value = productData.price;
                document.getElementById('productQuantity').value = productData.qty;
                document.getElementById('productImage').value = productData.picURLs || '';
            })
            .catch(error => {
                console.error('Error fetching product details:', error);
                alert('Failed to load product details. Please try again.');
                window.location.href = '/seller.html'; // Redirect กลับหน้า seller dashboard หากโหลดข้อมูลไม่สำเร็จ
            });


    } else {
        alert('Product ID is missing.');
        window.location.href = '/seller.html';
    }

    // *** ดักจับ Form Submit Event ***
    const editProductForm = document.getElementById('edit-product-form');
    editProductForm.addEventListener('submit', function(event) {
        event.preventDefault(); // ป้องกัน Form Submit แบบ Default (Redirect)

        // *** ดึงข้อมูลจาก Form ***
        const productName = document.getElementById('productName').value;
        const productPrice = document.getElementById('productPrice').value;
        const productQuantity = document.getElementById('productQuantity').value;
        const productImage = document.getElementById('productImage').value;

        // *** เรียก API Endpoint สำหรับ Update สินค้า (PUT Request) ***
        fetch(`/seller/products/${productId}`, { // ใช้ productId ที่ดึงมาจาก URL แล้ว
            method: 'PUT', // ใช้ HTTP PUT Method สำหรับ Update
            headers: {
                'Content-Type': 'application/json' // บอก Backend ว่าส่งข้อมูล JSON ไป
            },
            body: JSON.stringify({ // แปลง Object ข้อมูลสินค้าเป็น JSON String
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
            alert(data.message); // แสดง Success Message จาก Backend
            window.location.href = '/seller.html'; // Redirect กลับไปหน้า Seller Dashboard หลังจาก Update สำเร็จ
        })
        .catch(error => {
            console.error('Error updating product:', error);
            alert('Failed to update product. Please try again.');
        });
    });
});