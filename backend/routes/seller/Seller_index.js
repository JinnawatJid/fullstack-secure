const express = require('express');
const router = express.Router();

module.exports = (dbPool) => {
    const dashboardData = require('./dashboardData')(dbPool);
    const getProduct = require('./getProduct')(dbPool);
    const addProduct = require('./addProduct')(dbPool);
    const updateProduct = require('./updateProduct')(dbPool);
    const logout = require('./logout')(dbPool);
    const deleteProduct = require('./deleteProduct')(dbPool);

    router.use('/dashboard-data', dashboardData);
    router.use('/products', getProduct);
    router.use('/products', addProduct);
    router.use('/products', updateProduct);
    router.use('/logout', logout);
    router.use('/products', deleteProduct);

    return router;
};