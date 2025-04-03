require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const { csrfProtection, applyCsrf, getCsrfToken } = require('./middleware/csrf'); // Import

const server = express();
const port = process.env.PORT || 3000;

// const privateKey = fs.readFileSync('./localhost-key.pem', 'utf8');
// const certificate = fs.readFileSync('./localhost.pem', 'utf8');

// const credentials = {
//     key: privateKey,
//     cert: certificate
//   };

// const httpsServer = https.createServer(credentials, server);

const googleLoginRoute = require('./routes/googleLogin');
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const dbPool = require('./db');
const fetchUsersRoute = require('./routes/admin/fetchUsers');
const fetchProductRoute = require('./routes/admin/fetchProduct');
const checkAuthentication = require('./utils/checkAuth');
const sellerDashboardRoute = require('./routes/seller/Seller_index');

// Middleware
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use(cookieParser());

// Serve static files BEFORE defining API routes
server.use(express.static(path.join(__dirname, '../frontend')));

// Enable CSRF protection
server.use(applyCsrf); // ใช้ middleware ที่ import มา

// Create an endpoint to get CSRF token
server.get('/csrf-token', csrfProtection, getCsrfToken); // ใช้ handler ที่ import มา


server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  });

server.use('/login', loginRoute(dbPool));
server.use('/register', registerRoute(dbPool));
server.use('/auth/google', googleLoginRoute(dbPool));

server.get('/api/config', (req, res) => {
  res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID });
});

server.use('/api/getUsers', fetchUsersRoute);
server.use('/api/getProduct', fetchProductRoute);

server.get('/Admin/dashboard.html', checkAuthentication, (req, res) => {
    if (req.user && req.user.role === 'Admin') {
      res.sendFile(path.join(__dirname, '../frontend/Admin/dashboard.html'));
    } else {
      res.redirect('/index.html');
      res.status(403).send('Unauthorized'); 
    }
  });
  
  server.get('/Seller/shop.html', checkAuthentication, (req, res) => {
    if (req.user && req.user.role === 'Seller') {
      res.sendFile(path.join(__dirname, '../frontend/Seller/shop.html'));
    } else {
      res.redirect('/index.html');
      res.status(403).send('Unauthorized'); 
    }
  });
  
  server.get('/Member/catalog.html', checkAuthentication, (req, res) => {
    if (req.user && (req.user.role === 'Member' || req.user.role === 'Admin' || req.user.role === 'Seller')) {
      res.sendFile(path.join(__dirname, '../frontend/Member/catalog.html'));
    } else {
      res.redirect('/index.html');
      res.status(403).send('Unauthorized'); 
    }
  });

server.use('/seller', csrfProtection, sellerDashboardRoute(dbPool)); // ยังคงใช้ csrfProtection โดยตรงกับ route นี้

// Error handling middleware (คงไว้)
server.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        return res.status(403).json({
            message: 'Invalid or missing CSRF token. Please refresh the page and try again.'
        });
    }

    console.error(err.stack);
    res.status(500).send('Something broke!');
});

server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});