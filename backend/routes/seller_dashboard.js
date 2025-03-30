const express = require('express');
const router = express.Router();

module.exports = (dbPool) => {
    router.get('/dashboard-data', async (req, res) => {
        try {
            // Set total sales to N/A
            const totalSales = '1,500'; // ยอดขายรวม
            const bestSeller = 'Apple (100 kg sold)'; // สินค้าขายดี
            const vatAmount = '105'; // ยอดภาษีมูลค่าเพิ่ม

            // Fetch product list
            const productListQuery = 'SELECT "productID" AS "ID", "productName" AS "Name", "price" AS "Price", "qty" AS "Quantity", "picURLs" AS "Image" FROM "Product"';
            const productListResult = await dbPool.query(productListQuery);

            // Send response
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

    router.get('/products/:productId', async (req, res) => {
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

    router.post('/products', async (req, res) => {
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
            res.status(500).json({ message: 'Failed to add product.' });
        }
    });

    router.put('/products/:productId', async (req, res) => {
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

    router.post('/logout', async (req, res) => {
        try {
            console.log('User logout');
            res.status(200).json({ message: 'Logout successful' });
        } catch (error) {
            console.error('Error during logout:', error);
            res.status(500).json({ message: 'Logout failed' });
        }
    });

    router.delete('/products/:productId', async (req, res) => {
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