const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const dbPool = require('./db');
const sellerDashboardRoute = require('./routes/seller_dashboard');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/login', loginRoute(dbPool));
app.use('/register', registerRoute(dbPool));
app.use('/seller', sellerDashboardRoute(dbPool));

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});