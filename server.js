const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3007;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // ให้เสิร์ฟไฟล์ HTML, CSS, JS

// Import routes
const loginRoutes = require('./routes/login');
app.use('/login', loginRoutes);
const registerRoutes = require('./routes/register');
app.use('/register', registerRoutes);

// เสิร์ฟหน้า index.html เป็นหน้าแรก
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
