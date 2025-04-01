const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser'); // Add cookie-parser
const csrf = require('csurf'); // Add CSRF protection
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const loginRoute = require('./routes/auth/login');
const registerRoute = require('./routes/auth/register');
const dbPool = require('./config/db');
const sellerDashboardRoute = require('./seller/Seller_index');
const { sanitizeRequestBody } = require('./middleware/sanitizer');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser()); // Add cookie parser middleware before CSRF

// Add sanitization middleware after body parsing
app.use(sanitizeRequestBody);
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../frontend/Seller')));

// CORS configuration
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, CSRF-Token');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// Add CSP headers to prevent XSS
app.use((req, res, next) => {
    res.header('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;");
    next();
});

// Setup CSRF protection
const csrfProtection = csrf({ 
    cookie: {
        key: '_csrf',
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    } 
});

// Enable CSRF protection for all POST, PUT, DELETE routes
app.use((req, res, next) => {
    // Skip CSRF for login and registration routes
    if (req.path === '/login' && req.method === 'POST') {
        return next();
    }
    if (req.path === '/register' && req.method === 'POST') {
        return next();
    }
    
    // Apply CSRF protection for all other routes that modify data
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        return csrfProtection(req, res, next);
    }
    
    next();
});

// Create an endpoint to get CSRF token
app.get('/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Routes
app.use('/login', loginRoute(dbPool));
app.use('/register', registerRoute(dbPool));
app.use('/seller', csrfProtection, sellerDashboardRoute(dbPool)); // Apply CSRF on seller routes

// Error handling middleware
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        // Handle CSRF token errors
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