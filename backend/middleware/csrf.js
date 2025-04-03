const csrf = require('csurf');

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

// Middleware to apply CSRF protection to specific methods
const applyCsrf = (req, res, next) => {
    // Skip CSRF for login and registration routes (example)
    if (req.path === '/login' && req.method === 'POST') {
        return next();
    }

    if (req.path === '/auth/google' && req.method === 'POST') {
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
};

// Endpoint to get CSRF token
const getCsrfToken = (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
};

module.exports = { csrfProtection, applyCsrf, getCsrfToken };