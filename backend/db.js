const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "my-mysql", // Use the MySQL service name as the host
  user: "myuser", // MySQL user you configured in docker-compose
  password: "1234", // MySQL password you configured in docker-compose
  database: "mydatabase", // MySQL database you configured in docker-compose
  port: 3306 // Use the default MySQL port
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL Connection Failed: ", err);
    return;
  }
  console.log("✅ MySQL Connected...");
});

module.exports = db;
