async function fetchUsers() {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        console.error('No authentication token found. Redirecting to login.');
        Swal.fire({
            icon: 'warning',
            title: 'Authentication Required',
            text: 'No authentication token found. Redirecting to login in 2 seconds...',
            timer: 2000,
            showConfirmButton: false,
            willClose: () => {
                window.location.href = '/';
            }
        });
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/getUsers', {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                console.error('Authentication failed. Redirecting to login.');
                Swal.fire({
                    icon: 'error',
                    title: 'Authentication Failed',
                    text: 'Your authentication has failed. Redirecting to login in 2 seconds...',
                    timer: 2000,
                    showConfirmButton: false,
                    willClose: () => {
                        localStorage.removeItem('authToken');
                        window.location.href = '/';
                    }
                });
                return;
            } else {
                const errorMessage = await response.text();
                console.error('Error fetching users:', response.status, errorMessage);
                // You might want to display a different SweetAlert for other errors
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: `Error fetching users: ${response.status} - ${errorMessage}`,
                });
                return;
            }
        }

        const users = await response.json();
        console.log(users);

        const tableBody = document.getElementById('user-table');
        tableBody.innerHTML = '';

        users.forEach(user => {
            const row = `<tr>
                <td>${user.userid}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
            </tr>`;
            tableBody.innerHTML += row;
        });

    } catch (error) {
        console.error('Error fetching users:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Error fetching users: ${error.message}`,
        });
    }
}


async function fetchProduct() {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
        console.error('No authentication token found. Redirecting to login.');
        Swal.fire({
            icon: 'warning',
            title: 'Authentication Required',
            text: 'No authentication token found. Redirecting to login in 2 seconds...',
            timer: 2000,
            showConfirmButton: false,
            willClose: () => {
                window.location.href = '/';
            }
        });
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/getProduct', {
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                console.error('Authentication failed. Redirecting to login.');
                Swal.fire({
                    icon: 'error',
                    title: 'Authentication Failed',
                    text: 'Your authentication has failed. Redirecting to login in 2 seconds...',
                    timer: 2000,
                    showConfirmButton: false,
                    willClose: () => {
                        localStorage.removeItem('authToken');
                        window.location.href = '/';
                    }
                });
                return;
            } else {
                const errorMessage = await response.text();
                console.error('Error fetching product:', response.status, errorMessage);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: `Error fetching product: ${response.status} - ${errorMessage}`,
                });
                return;
            }
        }

        const product = await response.json();
        console.log(product);

        const tableBody = document.getElementById('product-table');
        tableBody.innerHTML = '';

        product.forEach(pd => {
            const row = `<tr>
                <td>${pd.productid}</td>
                <td>${pd.productname}</td>
                <td>${pd.price}</td>
                <td>${pd.qty}</td>
            </tr>`;
            tableBody.innerHTML += row;
        });

    } catch (error) {
        console.error('Error fetching product:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Error fetching product: ${error.message}`,
        });
    }
}

async function loadData() {
    await fetchUsers();
    await fetchProduct();
}

window.onload = loadData;