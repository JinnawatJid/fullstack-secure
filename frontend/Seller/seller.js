document.addEventListener('DOMContentLoaded', () => {
    // Get CSRF token when page loads
    let csrfToken = '';
    
    // Fetch CSRF token first
    getCsrfToken().then(() => {
        // Then load dashboard data
        loadDashboardData();
    });
    
    async function getCsrfToken() {
        try {
            const response = await fetch('/csrf-token');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            csrfToken = data.csrfToken;
            
            // Store CSRF token in meta tag for easy access
            const metaTag = document.createElement('meta');
            metaTag.name = 'csrf-token';
            metaTag.content = csrfToken;
            document.head.appendChild(metaTag);
            
            return csrfToken;
        } catch (error) {
            console.error('Error fetching CSRF token:', error);
            alert('Failed to load security token. Please refresh the page.');
        }
    }

    function decodeJwt(token) {
        try {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            window
              .atob(base64)
              .split("")
              .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join("")
          );
          return JSON.parse(jsonPayload);
        } catch (error) {
          return null;
        }
      }

    const addProductModal = document.getElementById('add-product-modal');
    const editProductModal = document.getElementById('edit-product-modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    const cancelButtons = document.querySelectorAll('.cancel-button');

    // Close modals with a single function
    const closeModals = () => {
        addProductModal.style.display = 'none';
        editProductModal.style.display = 'none';
    };

    closeButtons.forEach(button => button.addEventListener('click', closeModals));
    cancelButtons.forEach(button => button.addEventListener('click', closeModals));
    window.addEventListener('click', (event) => {
        if (event.target === addProductModal || event.target === editProductModal) {
            closeModals();
        }
    });

    // Add Product button
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            document.getElementById('add-product-form').reset();
            addProductModal.style.display = 'block';
        });
    }

    // Add Product form submission
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const productName = document.getElementById('productName').value;
            const productPrice = document.getElementById('productPrice').value;
            const productQuantity = document.getElementById('productQuantity').value;
            const productImage = document.getElementById('productImage').value;

            if (!productName || !productPrice || !productQuantity) {
                alert('Please fill in all required fields');
                return;
            }

            try {
                const response = await fetch('/seller/products', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'CSRF-Token': csrfToken // Add CSRF token to header
                    },
                    body: JSON.stringify({ productName: productName, price: productPrice, qty: productQuantity, picURLs: productImage })
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();

                alert(data.message);
                addProductModal.style.display = 'none';
                loadDashboardData();
            } catch (error) {
                console.error('Error adding product:', error);
                alert('Failed to add product. Please try again.');
            }
        });
    }

    // Edit Product form submission
    const editProductForm = document.getElementById('edit-product-form');
    if (editProductForm) {
        editProductForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const productId = document.getElementById('edit-product-id').value;
            const productName = document.getElementById('edit-productName').value;
            const productPrice = document.getElementById('edit-productPrice').value;
            const productQuantity = document.getElementById('edit-productQuantity').value;
            const productImage = document.getElementById('edit-productImage').value;

            if (!productId || !productName || !productPrice || !productQuantity) {
                alert('Please fill in all required fields');
                return;
            }

            try {
                const response = await fetch(`/seller/products/${productId}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'CSRF-Token': csrfToken // Add CSRF token to header
                    },
                    body: JSON.stringify({ productName, productPrice, productQuantity, productImage })
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();

                alert(data.message);
                editProductModal.style.display = 'none';
                loadDashboardData();
            } catch (error) {
                console.error('Error updating product:', error);
                alert('Failed to update product. Please try again.');
            }
        });
    }

    // Load dashboard data
    function loadDashboardData() {
        fetch('/seller/dashboard-data')
            .then(response => response.json())
            .then(data => {
                document.getElementById('total-sales-value').textContent = `฿${data.totalSales}`;
                document.getElementById('best-seller-value').textContent = data.bestSeller;
                document.getElementById('vat-value').textContent = `฿${data.vatAmount}`;
    
                const productTableBody = document.getElementById('product-table-body');
                productTableBody.innerHTML = '';
    
                data.products.forEach(product => {
                    const row = productTableBody.insertRow();
                    row.setAttribute('data-product-id', product.ID);
    
                    row.insertCell().textContent = product.ID;
    
                    const imageCell = row.insertCell();
                    const productImage = document.createElement('img');
                    // Sanitize URL
                    const imageUrl = product.Image || 'placeholder.jpg';
                    // Only allow http/https URLs or relative paths
                    if (imageUrl.match(/^(https?:\/\/|\/)/)) {
                        productImage.src = imageUrl;
                    } else {
                        productImage.src = 'placeholder.jpg';
                    }
                    productImage.style.width = '50px';
                    productImage.style.height = '50px';
                    imageCell.appendChild(productImage);
    
                    row.insertCell().textContent = product.Name;
                    row.insertCell().textContent = product.Price;
                    row.insertCell().textContent = product.Quantity;
    
                    // Create action buttons safely
                    const actionsCell = row.insertCell();
                    
                    const editBtn = document.createElement('button');
                    editBtn.className = 'edit-btn';
                    editBtn.textContent = 'Edit';
                    editBtn.addEventListener('click', () => editProduct(product.ID));
                    
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-btn';
                    deleteBtn.textContent = 'Delete';
                    deleteBtn.addEventListener('click', () => deleteProduct(product.ID));
                    
                    actionsCell.appendChild(editBtn);
                    actionsCell.appendChild(deleteBtn);
                });
            })
            .catch(error => console.error('Error fetching dashboard data:', error));
    }

    // Edit product
    window.editProduct = async (productId) => {
        try {
            const response = await fetch(`/seller/products/${productId}`);
            const productData = await response.json();

            document.getElementById('edit-product-id').value = productId;
            document.getElementById('edit-productName').value = productData.productName;
            document.getElementById('edit-productPrice').value = productData.price;
            document.getElementById('edit-productQuantity').value = productData.qty;
            document.getElementById('edit-productImage').value = productData.picURLs || '';

            editProductModal.style.display = 'block';
        } catch (error) {
            console.error('Error fetching product details:', error);
            alert('Failed to load product details. Please try again.');
        }
    };

    // Delete product
    window.deleteProduct = async (productId) => {
        if (!confirm(`Are you sure you want to delete product ID: ${productId}?`)) return;

        try {
            const response = await fetch(`/seller/products/${productId}`, { 
                method: 'DELETE',
                headers: {
                    'CSRF-Token': csrfToken // Add CSRF token to header
                }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const productRow = document.querySelector(`#product-table-body tr[data-product-id="${productId}"]`);
            if (productRow) productRow.remove();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product. Please try again.');
        }
    };

    // Logout
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            localStorage.removeItem('user');
            try {
                const response = await fetch('/seller/logout', { 
                    method: 'POST',
                    headers: {
                        'CSRF-Token': csrfToken // Add CSRF token to header
                    }
                });
                if (response.ok) {
                    window.location.href = '/index.html';
                } else {
                    alert('Logout failed. Please try again.');
                }
            } catch (error) {
                console.error('Error calling logout API:', error);
                alert('Logout failed due to network error.');
            }
        });
    }
});

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

// Function to handle user icon click
function handleUserIconClick() {
  const dropdown = document.getElementById('user-dropdown');
  dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

// Function to handle logout
function handleLogout() {
  localStorage.removeItem('authToken');
  window.location.href = '/'; // Redirect to login page (assuming '/' is your login page)
}

// Function to show the profile modal
function showProfileModal() {
  const authToken = localStorage.getItem("authToken");
  const profileModal = document.getElementById("profileModal");
  const profileModalUserImage = document.getElementById(
    "profile-modal-user-image"
  );
  const profileModalPayloadContainer = document.getElementById(
    "profile-modal-payload-container"
  );
  const userIconInNavbar = document.getElementById("user-icon");

  if (!authToken) {
    Swal.fire({
      icon: "warning",
      title: "Authentication Required",
      text: "You need to be logged in to view your profile.",
    });
    return;
  }

  const payload = decodeJwt(authToken);
  console.log(payload);

  if (payload) {
    // Display user picture (from the navbar icon)
    if (userIconInNavbar && userIconInNavbar.src) {
      profileModalUserImage.src = userIconInNavbar.src;
    } else {
      // Fallback image if navbar icon is not found
      profileModalUserImage.src =
        "https://cdn-icons-png.flaticon.com/512/11789/11789135.png";
    }

    // Display JWT payload
    profileModalPayloadContainer.innerHTML = ""; // Clear previous data

    // Function to format Unix timestamp to readable date
    const formatTimestamp = (timestamp) => {
      if (timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleString();
      }
      return 'N/A';
    };

    for (const key in payload) {
      if (payload.hasOwnProperty(key)) {
        const p = document.createElement("p");
        let value = payload[key];

        if (key === 'iat') {
          value = formatTimestamp(value) + ` (Timestamp: ${payload[key]})`;
        } else if (key === 'exp') {
          value = formatTimestamp(value) + ` (Timestamp: ${payload[key]})`;
        } else {
          value = JSON.stringify(value); // For other values
        }

        p.textContent = `${key}: ${value}`;
        profileModalPayloadContainer.appendChild(p);
      }
    }

    // Show the modal
    profileModal.style.display = "block";
  } else {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Could not decode the authentication token.",
    });
  }
}

function updateNavbarBasedOnAuth() {
  const authToken = localStorage.getItem('authToken');
  const navbarContainer = document.querySelector('.navbar-container');
  const navbarList = document.querySelector('.navbar');
  let loginButton = document.querySelector('.navbar li:last-child button');

  if (authToken) {
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

          const userIcon = userIconImg;

          const dropdown = document.createElement('div');
          dropdown.id = 'user-dropdown';
          dropdown.style.display = 'none';
          dropdown.style.position = 'absolute';
          dropdown.style.top = `${navbarContainer.offsetHeight + 5}px`;
          dropdown.style.right = `10px`;
          dropdown.style.backgroundColor = '#fff';
          dropdown.style.border = '1px solid #ccc';
          dropdown.style.borderRadius = '4px';
          dropdown.style.padding = '10px';
          dropdown.style.zIndex = '1000';

          const jwtPayload = decodeJwt(authToken);
          const userEmail = jwtPayload && jwtPayload.email ? jwtPayload.email : 'No email found';

          const emailItem = document.createElement('div');
          emailItem.textContent = userEmail;
          emailItem.classList.add('dropdown-item');
          emailItem.style.padding = '5px 0';
          emailItem.style.borderBottom = '1px solid #eee';

          const profileLink = document.createElement('a');
          profileLink.href = '#'; // Prevent default link behavior initially
          profileLink.textContent = 'Show Profile';
          profileLink.classList.add('dropdown-item');
          profileLink.style.display = 'block';
          profileLink.style.padding = '5px 0';
          profileLink.style.textDecoration = 'none';
          profileLink.style.color = '#333';
          profileLink.addEventListener('click', (event) => {
              event.preventDefault(); // Prevent navigation
              showProfileModal();
              const dropdown = document.getElementById('user-dropdown');
              if (dropdown) {
                  dropdown.style.display = 'none'; // Close the dropdown
              }
          });

          const logoutLink = document.createElement('a');
          logoutLink.href = '#';
          logoutLink.textContent = 'Logout';
          logoutLink.classList.add('dropdown-item');
          logoutLink.style.display = 'block';
          logoutLink.style.padding = '5px 0';
          logoutLink.style.textDecoration = 'none';
          logoutLink.style.color = '#333';
          logoutLink.style.cursor = 'pointer';
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
      if (!loginButton) {
          const loginButtonListItem = document.querySelector('.navbar li:last-child');
          if (loginButtonListItem) {
              loginButton = document.createElement('button');
              loginButton.style.backgroundColor = '#5cb85c !important';
              loginButton.style.borderColor = '#5cb85c !important';
              loginButton.style.color = 'white !important';
              loginButton.style.fontWeight = 'bold';
              loginButton.style.textDecoration = 'none';
              loginButton.style.padding = '8px 12px';
              loginButton.style.transition = 'background 0.3s';
              loginButton.style.borderRadius = '4px';
              loginButton.textContent = 'Login';
              loginButtonListItem.appendChild(loginButton);
              loginButton.addEventListener('click', () => {
                  window.location.href = '/';
              });
          }
      }
  }
}

// Function to close the profile modal
function closeProfileModal() {
  const profileModal = document.getElementById('profileModal');
  profileModal.style.display = 'none';
}

async function autheUser() {
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
    return false; // Indicate that authentication failed
  }

  // Decode the JWT token
  const decodedToken = decodeJwt(authToken);

  if (decodedToken) {
    console.log('Decoded JWT Payload in autheUser:', decodedToken);
    if (decodedToken.role === 'Seller') {
      console.log('User role is Seller. Proceeding');
      return true; // Indicate authentication and role check successful
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Access Restricted',
        text: `User role is not Seller: ${decodedToken.role}. Redirecting to login...`,
        timer: 2000,
        showConfirmButton: false,
        willClose: () => {
          window.location.href = '/index.html';
        }
      });
      return false;
    }
  } else {
    console.error('Failed to decode JWT token in autheUser.');
    // Optionally handle the case where the token is invalid, e.g., redirect to login
    return false; // Indicate authentication failed due to invalid token
  }
}

async function loadData() {
  await autheUser(); // Ensure the user is authenticated before loading data
  updateNavbarBasedOnAuth();

  // Add event listener to the close button of the modal after the DOM is loaded
  const closeButton = document.querySelector('.profile-modal-close');
  if (closeButton) {
      closeButton.addEventListener('click', closeProfileModal);
  }

  // Close modal if user clicks outside of it
  window.addEventListener('click', (event) => {
      const modal = document.getElementById('profileModal');
      if (event.target === modal) {
          closeProfileModal();
      }
  });
}

window.onload = loadData;