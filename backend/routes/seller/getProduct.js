const express = require('express');
const router = express.Router();
const escape = require('escape-html'); // ติดตั้ง: npm install escape-html

module.exports = (dbPool) => {
    router.get('/:productId', async (req, res) => {
        const productId = req.params.productId;
        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required to fetch product data.' });
        }
        try {
            const query = 'SELECT "productid", "productname", "price", "qty", "picurls" FROM "product" WHERE "productid" = $1';
            const results = await dbPool.query(query, [productId]);

            if (results.rows.length === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Escape ข้อมูลก่อนส่งกลับ
            const product = {
                ...results.rows[0],
                productName: escape(results.rows[0].productName),
                picURLs: results.rows[0].picURLs ? escape(results.rows[0].picURLs) : null
            };

            console.log('Product data fetched successfully:', product);
            res.json(product);
        } catch (error) {
            console.error('Error fetching product data:', error);
            res.status(500).json({ message: 'Failed to fetch product data' });
        }
    });

    return router;
};