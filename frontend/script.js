document.addEventListener('DOMContentLoaded', async () => {
    // Get CSRF token on page load
    try {
        const csrfResponse = await fetch('/csrf-token');
        const csrfData = await csrfResponse.json();
        
        // Update CSRF token in meta tag
        const csrfMeta = document.querySelector('meta[name="csrf-token"]');
        if (csrfMeta) {
            csrfMeta.setAttribute('content', csrfData.csrfToken);
        } else {
            // Create meta tag if it doesn't exist
            const newMeta = document.createElement('meta');
            newMeta.setAttribute('name', 'csrf-token');
            newMeta.setAttribute('content', csrfData.csrfToken);
            document.head.appendChild(newMeta);
        }
    } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
    }

    // Helper function to get CSRF token
    function getCSRFToken() {
        const metaElement = document.querySelector('meta[name="csrf-token"]');
        return metaElement ? metaElement.getAttribute('content') : '';
    }

    // Get element forms
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Function to sanitize input (XSS protection)
    const sanitizeInput = (input) => {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    };

    // Handle login form
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const csrfToken = getCSRFToken();
            const errorMessage = document.getElementById('error-message');

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': csrfToken
                    },
                    body: JSON.stringify({
                        email,
                        password,
                        _csrf: csrfToken
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    // Login successful
                    localStorage.setItem('user', JSON.stringify({
                        email: sanitizeInput(data.email),
                        role: sanitizeInput(data.role)
                    }));

                    // Redirect to appropriate page
                    if (data.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else if (data.role === 'seller') {
                        window.location.href = 'seller.html';
                    } else {
                        window.location.href = 'member.html';
                    }
                } else {
                    // Login failed
                    errorMessage.textContent = data.message;
                    errorMessage.style.display = 'block';
                }
            } catch (error) {
                console.error('Login error:', error);
                errorMessage.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์';
                errorMessage.style.display = 'block';
            }
        });
    }

    // Handle register form
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const role = document.getElementById('reg-role').value;
            const csrfToken = getCSRFToken();
            const errorMessage = document.getElementById('register-error-message');
            const successMessage = document.getElementById('register-success-message');

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': csrfToken
                    },
                    body: JSON.stringify({ 
                        email, 
                        password, 
                        role,
                        _csrf: csrfToken 
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    // Registration successful
                    successMessage.textContent = data.message;
                    successMessage.style.display = 'block';
                    errorMessage.style.display = 'none';

                    // Reset form
                    registerForm.reset();

                    // Redirect to login page after 2 seconds
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                } else {
                    // Registration failed
                    errorMessage.textContent = data.message;
                    errorMessage.style.display = 'block';
                    successMessage.style.display = 'none';
                }
            } catch (error) {
                console.error('Registration error:', error);
                errorMessage.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์';
                errorMessage.style.display = 'block';
                successMessage.style.display = 'none';
            }
        });
    }
});