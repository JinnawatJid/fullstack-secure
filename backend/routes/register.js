// backend/routes/register.js
const express = require('express');
const router = express.Router();

module.exports = (dbPool) => {

    router.post('/', async (req, res) => {
        const { username, password, role } = req.body; // Get role from request body as well

        console.log('Registration attempt for:', username, 'Role:', role);

        // **Input Validation (Basic)** - Add more robust validation in real apps
        if (!username || !password || !role) {
            return res.status(400).json({ message: 'Username, password, and role are required.' }); // 400: Bad Request
        }

        try {
            // Check if username already exists
            const userCheckResult = await dbPool.query("SELECT * FROM users WHERE username = $1", [username]);
            if (userCheckResult.rows.length > 0) {
                return res.status(409).json({ message: 'Username already taken. Please choose a different username.' }); // 409: Conflict
            }

            // Insert new user into the database
            const insertResult = await dbPool.query(
                "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *", 
                [username, password, role] // Still using plain text password - insecure!
            );

            const newUser = insertResult.rows[0]; // Get the newly inserted user

            console.log('Registration successful for:', newUser.username, 'Role:', newUser.role, 'ID:', newUser.id);
            res.status(201).json({ message: 'User registered successfully!', user: { username: newUser.username, role: newUser.role } }); // 201: Created
        } catch (error) {
            console.error("Registration database error", error);
            return res.status(500).json({ message: 'Registration failed due to server error.' }); // 500: Internal Server Error
        }
    });

    return router;
};