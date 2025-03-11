const mysql = require('mysql');

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'login_regis'
});

// เชื่อมต่อกับฐานข้อมูล
const connectDB = () => {
    db.connect((err) => {
        if (err) {
            console.error('Database connection failed:', err);
            throw err;
        }
        console.log('Connected to database');
    });
};

module.exports = {
    db,
    connectDB
};