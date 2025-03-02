// backend/routes/login.js
const express = require('express');
const router = express.Router();

module.exports = (dbPool) => {

    router.post('/', (req, res) => {
        const { username, password } = req.body;

        console.log('Login attempt for:', username, 'Password:', password);

        // PostgreSQL Query to find user by username
        dbPool.query("SELECT * FROM users WHERE username = $1", [username])
            .then(result => {
                const user = result.rows[0]; // Get the first row from the result

                if (!user) {
                    console.log('User not found in database:', username);
                    return res.status(401).json({ message: 'Invalid username or password.' });
                }

                // **Password Comparison (Plain Text for now - SECURITY WARNING!)**
                if (user.password !== password) {
                    console.log('Incorrect password for:', username);
                    return res.status(401).json({ message: 'Invalid username or password.' });
                }

                console.log('Login successful for:', username, 'Role:', user.role);
                res.status(200).json({ role: user.role, username: user.username });
            })
            .catch(err => {
                console.error("Database query error", err); 
                return res.status(500).json({ message: 'Login failed due to server error.' });
            });
    });

    return router;
};