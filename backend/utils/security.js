const xss = require('xss');
const crypto = require('crypto');

// XSS protection
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return xss(input);
  } else if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  } else if (typeof input === 'object' && input !== null) {
    const sanitizedObj = {};
    for (const key in input) {
      sanitizedObj[key] = sanitizeInput(input[key]);
    }
    return sanitizedObj;
  }
  return input;
};

// SQL Injection protection
const escapeSQL = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/'/g, "''")
    .replace(/\\/g, "\\\\")
    .replace(/\0/g, "\\0")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\x1a/g, "\\Z");
};

// CSRF protection
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Validate CSRF token with improved safety
const validateCSRFToken = (requestToken, sessionToken) => {
  if (!requestToken || !sessionToken) {
    return false;
  }
  
  try {
    // Convert to string and ensure they are same length for timing-safe comparison
    const reqTokenStr = String(requestToken);
    const sessTokenStr = String(sessionToken);
    
    // If lengths don't match, return false immediately
    if (reqTokenStr.length !== sessTokenStr.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(
      Buffer.from(reqTokenStr),
      Buffer.from(sessTokenStr)
    );
  } catch (error) {
    console.error('CSRF validation error:', error);
    return false;
  }
};

// CSRF middleware
const csrfProtection = (req, res, next) => {
  const sessionToken = req.session.csrfToken;
  const requestToken = req.headers['x-csrf-token'] || req.body._csrf;
  
  if (!validateCSRFToken(requestToken, sessionToken)) {
    return res.status(403).json({
      message: 'Invalid CSRF token'
    });
  }
  
  next();
};

// Generate and set CSRF token middleware
const setCSRFToken = (req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCSRFToken();
  }
  
  // Set CSRF token in response locals and headers
  res.locals.csrfToken = req.session.csrfToken;
  res.set('X-CSRF-Token', req.session.csrfToken);
  
  next();
};

module.exports = {
  sanitizeInput,
  escapeSQL,
  generateCSRFToken,
  validateCSRFToken,
  csrfProtection,
  setCSRFToken
};