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
        const response = await fetch('https://www.sweetiefruity.site/api/getUsers', {
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
        const response = await fetch('https://www.sweetiefruity.site/api/getProduct', {
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
      if (decodedToken.role === 'Admin') {
        console.log('User role is Admin. Proceeding');
        return true; // Indicate authentication and role check successful
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Access Restricted',
          text: `User role is not Admin: ${decodedToken.role}. Redirecting to login...`,
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
    updateNavbarBasedOnAuth();
    await autheUser();
    await fetchUsers();
    await fetchProduct();

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