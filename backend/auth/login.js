const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { sanitizeInput } = require("../utils/security");

module.exports = (dbPool) => {
    router.post("/", async (req, res) => {
        // Sanitize inputs
        const { email, password } = sanitizeInput(req.body);

        console.log(
            "Login attempt for:",
            email,
            "Password:",
            "******** (hashed)"
        );

        try {
            // Using parameterized queries to prevent SQL injection
            const userQuery = 'SELECT * FROM "User" WHERE "Email" = $1';
            const userResult = await dbPool.query(userQuery, [email]);

            // Check if user exists
            if (userResult.rows.length === 0) {
                console.log("User not found in database:", email);
                return res
                    .status(401)
                    .json({ message: "Invalid email or password." });
            }

            const user = userResult.rows[0];

            // Check password
            const passwordMatch = await bcrypt.compare(password, user.HashPassword);

            if (!passwordMatch) {
                console.log("Incorrect password for user");
                return res
                    .status(401)
                    .json({ message: "Invalid email or password." });
            }

            // Convert role to lowercase for frontend consistency
            let clientRole = user.Role.toLowerCase();

            console.log(`[${new Date().toISOString()}] Login successful for: ${email}, Role: ${user.Role}, IP Address: ${req.ip}`);

            // Set up session
            req.session.userId = user.userID;
            req.session.userRole = user.Role;
            req.session.userEmail = user.Email;

            // Safe response without XSS vulnerabilities
            res.status(200).json({
                role: clientRole,
                email: user.Email
            });

        } catch (error) {
            console.error("Login database error", error);
            // Generic error message that doesn't expose details
            res
                .status(500)
                .json({ message: "Login failed due to server error." });
        }
    });

    return router;
};