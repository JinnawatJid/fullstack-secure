const express = require('express');
const router = express.Router();
const pool = require('../db'); // Import your database connection

// Fetch all product
router.get('/product', async (req, res) => {
    console.log("Fetching product...");
    try {
        const result = await pool.query('SELECT productid, productname, price, qty FROM product');
        res.json(result.rows);  // Responding with the user data
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;
