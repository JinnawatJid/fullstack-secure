const express = require('express');
const router = express.Router();

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
            res.status(200).json({ message: `Product ID ${productId} deleted successfully.` });
        } catch (error) {
            console.error('Error deleting product from database:', error);
            res.status(500).json({ message: 'Failed to delete product from database.' });
        }
    });

    return router;
};