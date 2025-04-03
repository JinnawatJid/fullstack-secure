document.addEventListener("DOMContentLoaded", () => {
    const catalogContainer = document.querySelector('.catalog-container');
    const loadingMessage = document.querySelector('.loading-message');
    const errorMessage = document.querySelector('.error-message');
    const navbarContainer = document.querySelector('.navbar-container');
    const navbarList = document.querySelector('.navbar');
    let userIcon = document.querySelector('.navbar li:last-child img');
    let loginButton = document.querySelector('.navbar li:last-child button');

    // Function to decode JWT (basic implementation)
    function decodeJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            return null;
        }
    }

    // Function to fetch product data with authentication
    function fetchProducts() {
        const authToken = localStorage.getItem('authToken');

        if (!authToken) {
            console.error('No authentication token found. Redirecting to login.');
            Swal.fire({
                icon: 'warning',
                title: 'Authentication Required',
                text: 'You need to be logged in to view the catalog. Redirecting to login in 2 seconds...',
                timer: 2000,
                showConfirmButton: false,
                willClose: () => {
                    window.location.href = '/';
                }
            });
            return;
        }

        fetch('/api/getProduct', {
            headers: {
                'Authorization': `Bearer ${authToken}`, // Include the token
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
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
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(products => {
            loadingMessage.style.display = 'none';
            displayProducts(products);
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            loadingMessage.style.display = 'none';
            errorMessage.style.display = 'block';
        });
    }

    // Function to display product data in the HTML (remains the same)
    function displayProducts(products) {
        catalogContainer.innerHTML = '';

        if (products && Object.keys(products).length > 0) {
            Object.values(products).forEach(product => {
                const productBox = document.createElement('div');
                productBox.classList.add('product-box');

                const productImage = document.createElement('img');
                productImage.src = product.picurls;
                productImage.alt = product.name;
                productImage.classList.add('product-image');

                const productName = document.createElement('h3');
                productName.classList.add('product-name');
                productName.textContent = product.productname || product.name;

                const priceButtonContainer = document.createElement('div');
                priceButtonContainer.classList.add('price-button-container');

                const productPrice = document.createElement('p');
                productPrice.classList.add('product-price');
                productPrice.textContent = `$${(typeof product.price === 'number' && !isNaN(product.price) ? product.price.toFixed(2) : (typeof product.price === 'string' && !isNaN(parseFloat(product.price)) ? parseFloat(product.price).toFixed(2) : '0.00'))}`;

                const addToCartButton = document.createElement('img');
                addToCartButton.src = 'https://cdn-icons-png.flaticon.com/512/5974/5974633.png';
                addToCartButton.alt = 'Add to Cart';
                addToCartButton.classList.add('add-to-cart-button');
                addToCartButton.style.cursor = 'pointer';

                priceButtonContainer.appendChild(productPrice);
                priceButtonContainer.appendChild(addToCartButton);

                productBox.appendChild(productImage);
                productBox.appendChild(productName);
                productBox.appendChild(priceButtonContainer);

                catalogContainer.appendChild(productBox);
            });
        } else {
            catalogContainer.innerHTML = '<p>No products available.</p>';
        }
    }

    // Function to handle user icon click
    function handleUserIconClick() {
        const dropdown = document.getElementById('user-dropdown');
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }

    // Function to handle logout
    function handleLogout() {
        localStorage.removeItem('authToken');
        window.location.href = '../index.html'; // Redirect to login page
    }

    // Check for JWT and update login button
    const authToken = localStorage.getItem('authToken');

    if (authToken) {
        // User is logged in, change to user icon
        if (loginButton) {
            const userIconImg = document.createElement('img');
            userIconImg.src = 'https://cdn-icons-png.flaticon.com/512/11789/11789135.png';
            userIconImg.alt = 'User';
            userIconImg.style.width = '36px';
            userIconImg.style.height = '36px';
            userIconImg.style.cursor = 'pointer';
            userIconImg.style.borderRadius = '50%';
            userIconImg.id = 'user-icon';

            const loginButtonListItem = loginButton.parentNode;
            loginButtonListItem.removeChild(loginButton);
            loginButtonListItem.appendChild(userIconImg);

            userIcon = userIconImg;

            const dropdown = document.createElement('div');
            dropdown.id = 'user-dropdown';
            dropdown.style.display = 'none';
            dropdown.style.position = 'absolute';
            dropdown.style.top = `${navbarContainer.offsetHeight + 5}px`;
            dropdown.style.right = `10px`;

            const jwtPayload = decodeJwt(authToken);
            const userEmail = jwtPayload && jwtPayload.email ? jwtPayload.email : 'No email found';

            const emailItem = document.createElement('div');
            emailItem.textContent = userEmail;
            emailItem.classList.add('dropdown-item');

            const profileLink = document.createElement('a');
            profileLink.href = 'profile.html';
            profileLink.textContent = 'Show Profile';
            profileLink.classList.add('dropdown-item');

            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.textContent = 'Logout';
            logoutLink.classList.add('dropdown-item');
            logoutLink.addEventListener('click', handleLogout);

            dropdown.appendChild(emailItem);
            dropdown.appendChild(profileLink);
            dropdown.appendChild(logoutLink);
            document.body.appendChild(dropdown);

            userIcon.addEventListener('click', handleUserIconClick);

            document.addEventListener('click', (event) => {
                if (dropdown.style.display === 'block' && event.target !== userIcon && !dropdown.contains(event.target)) {
                    dropdown.style.display = 'none';
                }
            });
        }
    } else {
        // User is not logged in, keep the login button and add event listener
        if (loginButton) {
            loginButton.addEventListener('click', () => {
                window.location.href = '../index.html';
            });
        }
    }

    // Call the function to fetch products when the page loads
    fetchProducts();
});