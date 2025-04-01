const express = require('express');
const router = express.Router();

module.exports = (dbPool) => {
    router.put('/:productId', async (req, res) => {
        const productId = req.params.productId;
        const { productName, productPrice, productQuantity, productImage } = req.body;

        if (!productId || !productName || !productPrice || !productQuantity) {
            return res.status(400).json({ message: 'Product ID, name, price, and quantity are required for update.' });
        }

        try {
            const updateQuery = 'UPDATE "Product" SET "productName" = $1, "price" = $2, "qty" = $3, "picURLs" = $4 WHERE "productID" = $5';
            const results = await dbPool.query(updateQuery, [productName, productPrice, productQuantity, productImage, productId]);

            if (results.rowCount === 0) {
                return res.status(404).json({ message: 'Product not found for update' });
            }

            res.json({ message: `Product ID ${productId} updated successfully.` });
        } catch (error) {
            console.error('Error updating product data:', error);
            res.status(500).json({ message: 'Failed to update product data' });
        }
    });

    return router;
};