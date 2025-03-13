const express = require('express');
const router = express.Router();

module.exports = (dbPool) => {
    router.get('/dashboard-data', async (req, res) => {
        try {
            // Set total sales to N/A
            const totalSales = '1,500'; // ยอดขายรวม
            const bestSeller = 'Apple (100 kg sold)'; // สินค้าขายดี
            const vatAmount = '105'; // ยอดภาษีมูลค่าเพิ่ม

            // Fetch product list พร้อมดึง column รูปภาพ (picURLs) และตั้ง alias เป็น Image
            const productListQuery = 'SELECT productID AS ID, productName AS Name, price AS Price, qty AS Quantity, picURLs AS Image FROM product';
            const productListResult = await new Promise((resolve, reject) => {
                dbPool.query(productListQuery, (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });

            // Send response
            res.json({
                totalSales: totalSales,
                bestSeller: bestSeller,
                vatAmount: vatAmount,
                products: productListResult,
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
            const query = 'SELECT productID, productName, price, qty, picURLs FROM product WHERE productID = ?';
            const results = await new Promise((resolve, reject) => {
                dbPool.query(query, [productId], (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });

            if (results.length === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }

            res.json(results[0]); // ส่งข้อมูลสินค้ากลับไป (object สินค้า object เดียว)

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
            const insertQuery = 'INSERT INTO product (productName, price, qty, picURLs) VALUES (?, ?, ?, ?)';
            await new Promise((resolve, reject) => {
                dbPool.query(insertQuery, [productName, price, qty, picURLs], (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });

            res.status(201).json({ message: 'Product added successfully.' }); // Response เมื่อเพิ่มสินค้าสำเร็จ

        } catch (error) {
            console.error('Error adding product:', error);
            res.status(500).json({ message: 'Failed to add product.' });
        }
    });

    router.put('/products/:productId', async (req, res) => {
        const productId = req.params.productId;
        const { productName, productPrice, productQuantity, productImage } = req.body; // รับข้อมูลจาก Request Body

        if (!productId || !productName || !productPrice || !productQuantity) {
            return res.status(400).json({ message: 'Product ID, name, price, and quantity are required for update.' });
        }

        try {
            const updateQuery = 'UPDATE product SET productName = ?, price = ?, qty = ?, picURLs = ? WHERE productID = ?';
            const results = await new Promise((resolve, reject) => {
                dbPool.query(updateQuery, [productName, productPrice, productQuantity, productImage, productId], (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'Product not found for update' });
            }

            res.json({ message: `Product ID ${productId} updated successfully.` }); // Response เมื่อ Update สำเร็จ

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
            const deleteQuery = 'DELETE FROM product WHERE productID = ?';
            await new Promise((resolve, reject) => {
                dbPool.query(deleteQuery, [productId], (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }
                });
            });
            console.log(`Product ID ${productId} deleted from database.`);
            res.status(200).json({ message: `Product ID ${productId} deleted successfully.` });
        } catch (error) {
            console.error('Error deleting product from database:', error);
            res.status(500).json({ message: 'Failed to delete product from database.' });
        }
    });

    return router;
};