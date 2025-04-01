const express = require('express');
const router = express.Router();
const escape = require('escape-html'); // ติดตั้ง: npm install escape-html

module.exports = (dbPool) => {
    router.get('/', async (req, res) => {
        try {
            const totalSales = '3000';
            const bestSeller = 'Apple (100 kg sold)';
            const vatAmount = '105';

            const productListQuery = 'SELECT "productID" AS "ID", "productName" AS "Name", "price" AS "Price", "qty" AS "Quantity", "picURLs" AS "Image" FROM "Product"';
            const productListResult = await dbPool.query(productListQuery);

            const products = productListResult.rows.map(product => {
                return {
                    ...product,
                    Name: escape(product.Name), // Escape productName
                    Image: product.Image ? escape(product.Image) : null, // Escape picURLs if exists
                };
            });

            res.json({
                totalSales: totalSales,
                bestSeller: bestSeller,
                vatAmount: vatAmount,
                products: products, // ใช้ products ที่ escape แล้ว
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            res.status(500).json({ message: 'Failed to fetch dashboard data' });
        }
    });

    return router;
};