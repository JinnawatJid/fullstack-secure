const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const { csrfProtection, applyCsrf, getCsrfToken } = require('./middleware/csrf'); // Import
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const dbPool = require('./db');
const sellerDashboardRoute = require('./routes/seller/Seller_index');


// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../frontend/Seller')));


// Enable CSRF protection
app.use(applyCsrf); // ใช้ middleware ที่ import มา

// Create an endpoint to get CSRF token
app.get('/csrf-token', csrfProtection, getCsrfToken); // ใช้ handler ที่ import มา

// Routes (คงไว้)
app.use('/login', loginRoute(dbPool));
app.use('/register', registerRoute(dbPool));
app.use('/seller', csrfProtection, sellerDashboardRoute(dbPool)); // ยังคงใช้ csrfProtection โดยตรงกับ route นี้

// Error handling middleware (คงไว้)
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({
            message: 'Invalid or missing CSRF token. Please refresh the page and try again.'
        });
    }

    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});