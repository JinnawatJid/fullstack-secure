const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

//const https = require('https');
const http = require('http');
const fs = require('fs');

const app = express();
const port = 3000;

// const privateKey = fs.readFileSync('./localhost-key.pem', 'utf8');
// const certificate = fs.readFileSync('./localhost.pem', 'utf8');

// const credentials = {
//     key: privateKey,
//     cert: certificate
//   };

//const httpsServer = https.createServer(credentials, app);

const httpServer = http.createServer(app);

const cors = require('cors');
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const dbPool = require('./db');
const fetchUsersRoute = require('./admin/fetchUsers');
const fetchProductRoute = require('./admin/fetchProduct');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/login', loginRoute(dbPool));
app.use('/register', registerRoute(dbPool));
app.use(cors()); // Allow frontend to fetch data
app.use(express.json());
app.use('/api', fetchUsersRoute);
app.use('/api', fetchProductRoute);

httpServer.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});