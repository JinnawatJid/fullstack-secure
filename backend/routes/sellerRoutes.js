const express = require('express');
const router = express.Router();

module.exports = (productController, dashboardController) => {
    // Dashboard endpoints
    router.get('/dashboard-data', dashboardController.getDashboardData);

    // Product endpoints
    router.get('/products', productController.getAllProducts);
    router.get('/products/:productId', productController.getProductById);
    router.post('/products', productController.createProduct);
    router.put('/products/:productId', productController.updateProduct);
    router.delete('/products/:productId', productController.deleteProduct);

    // Route to display the edit product form
    router.get('/products/edit/:productId', (req, res) => {
        const productId = req.params.productId;
    
        productController.getProductById(req, res, (err, product) => {
            if (err) {
                // Handle error
                return res.status(500).send('Error loading product');
            }
            res.render('edit-product', { productId: productId, csrfToken: req.csrfToken() });
        });
    });

    // Logout
    router.post('/logout', (req, res) => {
        req.session.destroy();
        res.json({ message: 'Logout successful' });
    });

    return router;
};