require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const https = require('https');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// const privateKey = fs.readFileSync('./localhost-key.pem', 'utf8');
// const certificate = fs.readFileSync('./localhost.pem', 'utf8');

// const credentials = {
//     key: privateKey,
//     cert: certificate
//   };

// const httpsServer = https.createServer(credentials, app);

const googleLoginRoute = require('./routes/googleLogin');
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const dbPool = require('./db');
const fetchUsersRoute = require('./routes/admin/fetchUsers');
const fetchProductRoute = require('./routes/admin/fetchProduct');
const checkAuthentication = require('./utils/checkAuth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files BEFORE defining API routes
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  });

app.use('/login', loginRoute(dbPool));
app.use('/register', registerRoute(dbPool));
app.use('/auth/google', googleLoginRoute(dbPool));

app.get('/api/config', (req, res) => {
  res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID });
});

app.use('/api/getUsers', fetchUsersRoute);
app.use('/api/getProduct', fetchProductRoute);

app.get('/Admin/dashboard.html', checkAuthentication, (req, res) => {
  if (req.user && req.user.role === 'Admin') {
    res.sendFile(path.join(__dirname, '../frontend/Admin/dashboard.html'));
  } else {
    res.redirect('/index.html');
    res.status(403).send('Unauthorized'); 
  }
});

app.get('/Seller/shop.html', checkAuthentication, (req, res) => {
  if (req.user && req.user.role === 'Seller') {
    res.sendFile(path.join(__dirname, '../frontend/Seller/shop.html'));
  } else {
    res.redirect('/index.html');
    res.status(403).send('Unauthorized'); 
  }
});

app.get('/Member/catalog.html', checkAuthentication, (req, res) => {
  if (req.user && (req.user.role === 'Member' || req.user.role === 'Admin' || req.user.role === 'Seller')) {
    res.sendFile(path.join(__dirname, '../frontend/Member/catalog.html'));
  } else {
    res.redirect('/index.html');
    res.status(403).send('Unauthorized'); 
  }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});