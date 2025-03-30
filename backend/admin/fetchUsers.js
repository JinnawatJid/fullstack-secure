const express = require('express');
const router = express.Router();
const pool = require('../db'); // Import your database connection

// Fetch all users
router.get('/users', async (req, res) => {
    console.log("Fetching users...");
    try {
        const result = await pool.query('SELECT userid, email, role FROM users');
        res.json(result.rows);  // Responding with the user data
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
