const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

module.exports = (dbPool) => {
    router.post("/", async (req, res) => {
        const { email, password, role } = req.body;

        // แปลงค่า role ให้ตรงกับ ENUM ในฐานข้อมูล
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
            // ตรวจสอบว่า email มีอยู่แล้วหรือไม่
            const checkEmailQuery = 'SELECT * FROM "User" WHERE "Email" = $1'; // Changed 'email' to '"Email"'
            const checkEmailResult = await dbPool.query(checkEmailQuery, [email]);

            if (checkEmailResult.rows.length > 0) {
                return res
                    .status(409)
                    .json({
                        message: "Email already taken. Please choose a different email.",
                    });
            }

            // ทำการ hash รหัสผ่าน
            const hashedPassword = await bcrypt.hash(password, 10);

            // เพิ่มผู้ใช้ใหม่
            const insertUserQuery = 'INSERT INTO "User" ("Email", "HashPassword", "Role") VALUES ($1, $2, $3) RETURNING *'; // Changed 'email' and 'hashpassword' to '"Email"' and '"HashPassword"'
            const insertResult = await dbPool.query(insertUserQuery, [email, hashedPassword, dbRole]);

            const newUser = insertResult.rows[0];

            console.log(
                "Registration successful for:",
                newUser.Email, // Changed newUser.email to newUser.Email
                "Role:",
                newUser.Role, // Changed newUser.role to newUser.Role
                "ID:",
                newUser.userID // Assuming your column name is still "userID"
            );

            res.status(201).json({
                message: "User registered successfully!",
                user: { email: newUser.Email, role: newUser.Role }, // Changed user.email and user.role
            });

        } catch (error) {
            console.error("Registration error:", error);
            res
                .status(500)
                .json({ message: "Registration failed due to server error." });
        }
    });

    return router;
};