const express = require('express');
const router = express.Router();

module.exports = (dbPool) => {
    router.get('/', async (req, res) => {
        try {
            const totalSales = '3000'; // Note: Fix typo if intended (remove extra 0)
            const bestSeller = 'Apple (100 kg sold)';
            const vatAmount = '105';

            const productListQuery = 'SELECT "productID" AS "ID", "productName" AS "Name", "price" AS "Price", "qty" AS "Quantity", "picURLs" AS "Image" FROM "Product"';
            const productListResult = await dbPool.query(productListQuery);

            res.json({
                totalSales: totalSales,
                bestSeller: bestSeller,
                vatAmount: vatAmount,
                products: productListResult.rows,
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            res.status(500).json({ message: 'Failed to fetch dashboard data' });
        }
    });

    return router;
};