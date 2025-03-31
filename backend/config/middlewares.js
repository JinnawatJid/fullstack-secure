// backend/config/middlewares.js
const { sanitizeInput, generateCSRFToken } = require('../utils/security');
const session = require('express-session');

module.exports = (app) => {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'default_session_secret_replace_in_production',
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict'
    }
  }));

  // CSRF protection middleware
  app.use((req, res, next) => {
    // Skip for GET requests
    if (req.method === 'GET') {
      return next();
    }
    
    // Check CSRF token for other methods
    const requestToken = req.headers['x-csrf-token'];
    if (!requestToken || !validateCSRFToken(requestToken, req.session.csrfToken)) {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }
    next();
  });

  // Generate CSRF token for each session
  app.use((req, res, next) => {
    if (!req.session.csrfToken) {
      req.session.csrfToken = generateCSRFToken();
    }
    
    // Add CSRF token to response headers
    res.setHeader('X-CSRF-Token', req.session.csrfToken);
    next();
  });

  // Input sanitization middleware
  app.use((req, res, next) => {
    if (req.body) {
      req.sanitizedBody = sanitizeInput(req.body);
    }
    next();
  });
};