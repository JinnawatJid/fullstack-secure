const sanitizeHtml = require('sanitize-html'); // npm install sanitize-html

function sanitizeRequestBody(req, res, next) {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Sanitize string inputs to prevent XSS
        req.body[key] = sanitizeHtml(req.body[key], {
          allowedTags: [], // No HTML tags allowed
          allowedAttributes: {}, // No attributes allowed
          disallowedTagsMode: 'discard'
        });
      }
    });
  }
  next();
}

module.exports = { sanitizeRequestBody };