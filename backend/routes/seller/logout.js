const express = require('express');
const router = express.Router();

module.exports = (dbPool) => {
    router.post('/', async (req, res) => {
        try {
            console.log('User logout');
            res.status(200).json({ message: 'Logout successful' });
        } catch (error) {
            console.error('Error during logout:', error);
            res.status(500).json({ message: 'Logout failed' });
        }
    });

    return router;
};