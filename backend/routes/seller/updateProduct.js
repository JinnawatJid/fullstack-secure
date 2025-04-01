const express = require('express');
const router = express.Router();
const escape = require('escape-html');
const validator = require('validator');

module.exports = (dbPool) => {
    router.put('/:productId', async (req, res) => {
        const productId = req.params.productId;
        let { productName, productPrice, productQuantity, productImage } = req.body;

        if (!productId || !productName || !productPrice || !productQuantity) {
            return res.status(400).json({ message: 'Product ID, name, price, and quantity are required for update.' });
        }

        // Validate productId is a valid integer
        if (!validator.isInt(productId.toString())) {
            return res.status(400).json({ message: 'Invalid product ID format.' });
        }

        // Validate price and quantity are positive numbers
        if (!validator.isNumeric(productPrice.toString()) || parseFloat(productPrice) <= 0) {
            return res.status(400).json({ message: 'Price must be a positive number.' });
        }

        if (!validator.isInt(productQuantity.toString(), { min: 0 })) {
            return res.status(400).json({ message: 'Quantity must be a positive integer.' });
        }

        // Sanitize URL if provided
        if (productImage && !validator.isURL(productImage, { require_protocol: true })) {
            return res.status(400).json({ message: 'Invalid image URL format.' });
        }

        try {
            const updateQuery = 'UPDATE "Product" SET "productName" = $1, "price" = $2, "qty" = $3, "picURLs" = $4 WHERE "productID" = $5';
            const results = await dbPool.query(updateQuery, [productName, productPrice, productQuantity, productImage, productId]);

            if (results.rowCount === 0) {
                return res.status(404).json({ message: 'Product not found for update' });
            }

            res.json({ message: `Product ID ${escape(productId)} updated successfully.` });
        } catch (error) {
            console.error('Error updating product data:', error);
            res.status(500).json({ message: 'Failed to update product data' });
        }
    });

    return router;
};