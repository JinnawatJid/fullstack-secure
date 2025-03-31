const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Database connection
const dbPool = require('./config/db');

// Security middleware
const { sanitizeInput, csrfProtection, setCSRFToken } = require('./utils/security');

// Import models
const productModel = require('./models/productModel')(dbPool);

// Import controllers
const productController = require('./controllers/productController')(productModel);
const dashboardController = require('./controllers/dashboardController')(dbPool);

// Import routes
const sellerRoutes = require('./routes/sellerRoutes')(productController, dashboardController);
const loginRoutes = require('./auth/login')(dbPool);
const registerRoutes = require('./auth/register')(dbPool);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'a9b7c8d6e5f4g3h2i1j0k9l8m7n6o5p4q3r2s1t0u8v7w6x5y4z3a2b1c0',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Basic middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Set CSRF token for all requests
app.use(setCSRFToken);

// Add body sanitization middleware
app.use((req, res, next) => {
  if (req.body) {
    req.sanitizedBody = sanitizeInput(req.body);
  }
  next();
});

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-CSRF-Token');
  next();
});

// Serve CSRF token to client - this must be before CSRF protection
app.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.session.csrfToken });
});

// CSRF Protection middleware with exceptions
const csrfMiddleware = (req, res, next) => {
  // Skip CSRF for GET requests
  if (req.method === 'GET') {
    return next();
  }
  
  // Apply CSRF protection
  csrfProtection(req, res, next);
};

// Apply CSRF protection to routes
app.use('/api/seller', csrfMiddleware, sellerRoutes);
app.use('/login', csrfMiddleware, loginRoutes);
app.use('/register', csrfMiddleware, registerRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});