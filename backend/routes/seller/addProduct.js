const express = require('express');
const router = express.Router();
const escape = require('escape-html');
const validator = require('validator'); // npm install validator

module.exports = (dbPool) => {
    router.post('/', async (req, res) => {
        let { productName, price, qty, picURLs } = req.body;

        // Validate and sanitize inputs
        if (!productName || !price || !qty) {
            return res.status(400).json({ message: 'Product name, price, and quantity are required.' });
        }

        // Validate price and quantity are positive numbers
        if (!validator.isNumeric(price.toString()) || parseFloat(price) <= 0) {
            return res.status(400).json({ message: 'Price must be a positive number.' });
        }

        if (!validator.isInt(qty.toString(), { min: 0 })) {
            return res.status(400).json({ message: 'Quantity must be a positive integer.' });
        }

        // Sanitize URL if provided
        if (picURLs && !validator.isURL(picURLs, { require_protocol: true })) {
            // Either sanitize to a default image or reject
            return res.status(400).json({ message: 'Invalid image URL format.' });
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

    router.get('/products', async (req, res) => {
        try {
            const result = await dbPool.query('SELECT * FROM "Product"');
            const products = result.rows.map(product => {
                return {
                    ...product,
                    picURLs: product.picURLs ? escape(product.picURLs) : null,
                    productName: escape(product.productName)
                };
            });
            res.status(200).json(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({ message: 'Failed to fetch products' });
        }
    });

    return router;
};