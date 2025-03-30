require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const https = require('https');
const fs = require('fs');

const app = express();
const port = 3000;

const privateKey = fs.readFileSync('./localhost-key.pem', 'utf8');
const certificate = fs.readFileSync('./localhost.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate
  };

const httpsServer = https.createServer(credentials, app);

const googleLoginRoute = require('./routes/googleLogin');
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const dbPool = require('./db');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/login', loginRoute(dbPool));
app.use('/register', registerRoute(dbPool));
app.use('/auth/google', googleLoginRoute(dbPool));

app.get('/api/config', (req, res) => {
  res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID });
});

httpsServer.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});