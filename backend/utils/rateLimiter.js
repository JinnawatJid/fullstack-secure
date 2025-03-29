const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json({ message: options.message });
    },
    message: "Too many login attempts from this IP please try again after 15 minutes.",
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = loginLimiter;