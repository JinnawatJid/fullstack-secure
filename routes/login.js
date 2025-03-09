const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db'); // ดึง db.js ที่เชื่อมกับ MySQL
const router = express.Router();

// ตรวจสอบข้อมูล login
router.post('/', (req, res) => {
    const { username, password } = req.body;
    
    // ตรวจสอบว่ากรอกครบหรือไม่
    if (!username || !password) {
        return res.send('❌ Username or Password cannot be empty');
    }

    // ตรวจสอบ username ใน database
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) return res.send('❌ Database error');
        if (results.length === 0) return res.send('❌ Username not found');

        const user = results[0];

        // ตรวจสอบ password
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.send('❌ Incorrect password');


        // ตรวจสอบ role และ redirect ไปยังหน้าที่เหมาะสม
        switch (user.role) {
            case 'customer':
                return res.redirect('/customer.html');
            case 'stock':
                return res.redirect('/stock.html');
            case 'admin':
                return res.redirect('/admin.html');
            default:
                return res.send('❌ Role not found');
        }
    });
});

module.exports = router;
