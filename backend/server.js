const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config(); // Load environment variables

const app = express();
const port = process.env.PORT || 3000;

const loginRoute = require('./routes/auth/login');
const registerRoute = require('./routes/auth/register');
const dbPool = require('./config/db');
const sellerDashboardRoute = require('./seller/Seller_index'); // Updated path

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../frontend/Seller')));

// CORS configuration (optional but recommended)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Added methods
    next();
});

// Routes
app.use('/login', loginRoute(dbPool));
app.use('/register', registerRoute(dbPool));
app.use('/seller', sellerDashboardRoute(dbPool));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});