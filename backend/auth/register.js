const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { sanitizeInput } = require("../utils/security");

module.exports = (dbPool) => {
    router.post("/", async (req, res) => {
        // Sanitize inputs
        const { email, password, role } = sanitizeInput(req.body);

        // Map role to database enum
        let dbRole;
        switch (role) {
            case 'admin':
                dbRole = 'Admin';
                break;
            case 'seller':
                dbRole = 'Seller';
                break;
            default:
                dbRole = 'Member';
        }

        console.log("Registration attempt for:", email, "Role:", dbRole);

        if (!email || !password || !role) {
            return res
                .status(400)
                .json({ message: "Email, password, and role are required." });
        }

        try {
            // Using parameterized queries to prevent SQL injection
            const checkEmailQuery = 'SELECT * FROM "User" WHERE "Email" = $1';
            const checkEmailResult = await dbPool.query(checkEmailQuery, [email]);

            if (checkEmailResult.rows.length > 0) {
                return res
                    .status(409)
                    .json({
                        message: "Email already taken. Please choose a different email."
                    });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert using parameterized query
            const insertUserQuery = 'INSERT INTO "User" ("Email", "HashPassword", "Role") VALUES ($1, $2, $3) RETURNING *';
            const insertResult = await dbPool.query(insertUserQuery, [email, hashedPassword, dbRole]);

            const newUser = insertResult.rows[0];

            console.log(
                "Registration successful for:",
                newUser.Email,
                "Role:",
                newUser.Role,
                "ID:",
                newUser.userID
            );

            // Safe response without XSS vulnerabilities
            res.status(201).json({
                message: "User registered successfully!",
                user: { 
                    email: newUser.Email, 
                    role: newUser.Role
                }
            });

        } catch (error) {
            console.error("Registration error:", error);
            // Generic error message that doesn't expose details
            res
                .status(500)
                .json({ message: "Registration failed due to server error." });
        }
    });

    return router;
};