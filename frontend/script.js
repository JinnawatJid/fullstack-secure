document.addEventListener('DOMContentLoaded', () => {
    // รับ element forms
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // จัดการ login form
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('error-message');

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // เข้าสู่ระบบสำเร็จ
                    localStorage.setItem('user', JSON.stringify({ email: data.email, role: data.role }));

                    // ลิงก์ไปยังหน้าหลักตามบทบาท
                    if (data.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else if (data.role === 'seller') { // เปลี่ยนจาก manager เป็น seller
                        window.location.href = 'seller.html'; // เปลี่ยนจาก manager.html เป็น seller.html
                    } else {
                        window.location.href = 'member.html';
                    }
                } else {
                    // เข้าสู่ระบบล้มเหลว
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

    // จัดการ register form
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const role = document.getElementById('reg-role').value;
            const errorMessage = document.getElementById('register-error-message');
            const successMessage = document.getElementById('register-success-message');

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password, role })
                });

                const data = await response.json();

                if (response.ok) {
                    // สมัครสมาชิกสำเร็จ
                    successMessage.textContent = data.message;
                    successMessage.style.display = 'block';
                    errorMessage.style.display = 'none';

                    // รีเซ็ตฟอร์ม
                    registerForm.reset();

                    // เปลี่ยนเส้นทางไปยังหน้าล็อกอินหลังจาก 2 วินาที
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                } else {
                    // สมัครสมาชิกล้มเหลว
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