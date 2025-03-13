const mysql = require('mysql');

const dbPool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'login_regis'
});

dbPool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection error:', err);
    return;
  }
  console.log('Connected to MySQL database');
  connection.release(); // คืน connection กลับไปยัง pool
});

// เพิ่มฟังก์ชัน query แบบ callback เพื่อความสะดวก
dbPool.query = function(sql, values, callback) {
  return this.getConnection((err, connection) => {
    if (err) {
      return callback(err);
    }
    
    connection.query(sql, values, (error, results, fields) => {
      connection.release();
      callback(error, results, fields);
    });
  });
};

module.exports = dbPool;