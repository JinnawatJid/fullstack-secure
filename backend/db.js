const { Pool } = require("pg");

const pool = new Pool({
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
