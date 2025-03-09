const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db'); // เชื่อมต่อ MySQL
const router = express.Router();

// ฟังก์ชันตรวจสอบ password
function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
}

// จัดการ register
router.post('/', async (req, res) => {
    const { username, password } = req.body;

    // ตรวจสอบว่ากรอกครบหรือไม่
    if (!username || !password) {
        return res.send('❌ Username or Password cannot be empty');
    }

    // ตรวจสอบว่า username ซ้ำหรือไม่
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) return res.send('❌ Database error');
        if (results.length > 0) return res.send('❌ Username already exists');

        // ตรวจสอบ password
        if (!validatePassword(password)) {
            return res.send('❌ Password must contain at least 8 characters, including uppercase, lowercase, and a number.');
        }

        // ทำการ hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // บันทึกข้อมูลลง database
        db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
            [username, hashedPassword, 'customer'], 
            (err, result) => {
                if (err) return res.send('❌ Registration failed');
                res.send('✅ Registration successful! You can now login.');
            }
        );
    });
});

module.exports = router;
