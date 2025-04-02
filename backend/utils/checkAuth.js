// backend/routes/checkAuthen.js
const jwt = require('jsonwebtoken');

const secretKey = process.env.ACCESS_TOKEN_SECRET;

function checkAuthentication(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required: No token provided.' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      console.error('JWT Verification Error:', err);
      return res.status(403).json({ message: 'Authentication failed: Invalid token.' });
    }

    req.user = user;
    next();
  });
}

module.exports = checkAuthentication;