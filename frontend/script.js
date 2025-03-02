document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('login-form')) {
        const loginForm = document.getElementById('login-form');
        const errorMessage = document.getElementById('error-message');

        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const usernameInput = document.getElementById('username').value;
            const passwordInput = document.getElementById('password').value;

            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: usernameInput, password: passwordInput }),
            }) //ส่งแล้ว ได้ response กลับมา
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.message); });
                }
                return response.json();
            }) //เอา response มาใช้
            .then(data => {                
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('username', data.username);
                errorMessage.textContent = '';

                switch (data.role) {
                    case 'admin':
                        window.location.href = 'admin.html';
                        break;
                    case 'manager':
                        window.location.href = 'manager.html';
                        break;
                    case 'user':
                        window.location.href = 'user.html';
                        break;
                    default:
                        window.location.href = 'user.html'; 
                }
            })
            .catch(error => {
                errorMessage.textContent = error.message || 'Login failed. Please try again.';
            });
        });
    }

    if (document.getElementById('register-form')) {
        const registerForm = document.getElementById('register-form');
        const registerErrorMessage = document.getElementById('register-error-message');
        const registerSuccessMessage = document.getElementById('register-success-message');

        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const usernameInput = document.getElementById('reg-username').value;
            const passwordInput = document.getElementById('reg-password').value;
            const roleInput = document.getElementById('reg-role').value;

            fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: usernameInput, password: passwordInput, role: roleInput }),
            }) //ส่งแล้ว ได้ response กลับมา
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.message); });
                }
                return response.json();
            })
            .then(data => {
                registerErrorMessage.textContent = ''; 
                registerSuccessMessage.textContent = 'Registration successful! You can now login.'; 
            })
            .catch(error => {
                registerSuccessMessage.textContent = '';
                registerErrorMessage.textContent = error.message || 'Registration failed. Please try again.'; 
            });
        });
    }

    const dashboardContainer = document.querySelector('.dashboard-container');
    if (dashboardContainer) {
        const userRole = localStorage.getItem('userRole');
        const username = localStorage.getItem('username');
        const usernameDisplay = document.getElementById('username-display');
        const logoutButton = document.getElementById('logout-button');

        if (!userRole) {
            window.location.href = 'index.html'; 
        } else {
            if (usernameDisplay) {
                usernameDisplay.textContent = username || 'User';
            }

            const pageType = dashboardContainer.classList.contains('admin-dashboard') ? 'admin' :
                             dashboardContainer.classList.contains('manager-dashboard') ? 'manager' : 'user';

            if (pageType !== userRole) {
                alert("Unauthorized access. You are being redirected to your assigned dashboard.");
                switch (userRole) {
                    case 'admin': window.location.href = 'admin.html'; break;
                    case 'manager': window.location.href = 'manager.html'; break;
                    default: window.location.href = 'user.html';
                }
            }
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                localStorage.removeItem('userRole'); // Clear role on logout
                localStorage.removeItem('username'); // Clear username
                window.location.href = 'index.html'; // Redirect to login page
            });
        }
    }
});