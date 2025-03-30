require('dotenv').config(); // Load environment variables if using .env file

const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST|| 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD, // ensure this is a string
  port: process.env.DB_PORT || 5432,
});

pool
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL database");
  })
  .catch((err) => {
    console.error("Database connection error", err);
  });

module.exports = pool;
