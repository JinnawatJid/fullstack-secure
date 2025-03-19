const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const fs = require("fs");
const https = require("https");

const app = express();
const port = 3007;

const privateKey = fs.readFileSync('./localhost-key.pem','utf8');
const certificate = fs.readFileSync('./localhost.pem','utf8');

const credentials = {
  key: privateKey,
  cert: certificate
};

const httpsServer = https.createServer(credentials,app)

const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');
const dbPool = require('./db');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.get("/", function(req,res) {
  return res.sendFile(path.join(__dirname, "frontend", "index.html"))
});

app.use('/login', loginRoute(dbPool));
app.use('/register', registerRoute(dbPool));

httpsServer.listen(port, () => {
    console.log(`Server listening at https://localhost:${port}`);
});