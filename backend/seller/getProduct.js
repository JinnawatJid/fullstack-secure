const express = require('express');
const router = express.Router();

module.exports = (dbPool) => {
    router.get('/:productId', async (req, res) => {
        const productId = req.params.productId;
        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required to fetch product data.' });
        }
        try {
            const query = 'SELECT "productID", "productName", "price", "qty", "picURLs" FROM "Product" WHERE "productID" = $1';
            const results = await dbPool.query(query, [productId]);

            if (results.rows.length === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.json(results.rows[0]);
        } catch (error) {
            console.error('Error fetching product data:', error);
            res.status(500).json({ message: 'Failed to fetch product data' });
        }
    });

    return router;
};