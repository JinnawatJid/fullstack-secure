const express = require('express');
const router = express.Router();

module.exports = (dbPool) => {
    router.post('/', async (req, res) => {
        const { productName, price, qty, picURLs } = req.body;

        if (!productName || !price || !qty) {
            return res.status(400).json({ message: 'Product name, price, and quantity are required.' });
        }

        try {
            const insertQuery = 'INSERT INTO "Product" ("productName", "price", "qty", "picURLs") VALUES ($1, $2, $3, $4)';
            await dbPool.query(insertQuery, [productName, price, qty, picURLs]);

            res.status(201).json({ message: 'Product added successfully.' });
        } catch (error) {
            console.error('Error adding product:', error);
            res.status(500).json({ message: 'Failed to add product' });
        }
    });

    return router;
};