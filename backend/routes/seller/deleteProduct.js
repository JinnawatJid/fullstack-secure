const express = require('express');
const router = express.Router();
const escape = require('escape-html'); // ติดตั้ง: npm install escape-html

module.exports = (dbPool) => {
    router.delete('/:productId', async (req, res) => {
        const productId = req.params.productId;
        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required for deletion.' });
        }
        try {
            const deleteQuery = 'DELETE FROM "Product" WHERE "productID" = $1';
            await dbPool.query(deleteQuery, [productId]);

            console.log(`Product ID ${productId} deleted from database.`);

            // Escape productId และ message ก่อนส่งกลับ
            const escapedProductId = escape(productId);
            const escapedMessage = escape(`Product ID ${productId} deleted successfully.`);

            res.status(200).json({ message: escapedMessage });

        } catch (error) {
            console.error('Error deleting product from database:', error);

            // Escape error message ก่อนส่งกลับ
            const escapedErrorMessage = escape('Failed to delete product from database.');
            res.status(500).json({ message: escapedErrorMessage });
        }
    });

    return router;
};