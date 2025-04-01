const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

module.exports = (dbPool) => {
    router.post("/", async (req, res) => {
        const { email, password } = req.body;

        console.log(
            "Login attempt for:",
            email,
            "Password:",
            "******** (hashed)"
        );

        try {
            // ค้นหาผู้ใช้ในฐานข้อมูล
            const userQuery = 'SELECT * FROM "User" WHERE "Email" = $1'; // Changed 'email' to '"Email"'
            const userResult = await dbPool.query(userQuery, [email]);

            // ตรวจสอบว่าพบผู้ใช้หรือไม่
            if (userResult.rows.length === 0) {
                console.log("User not found in database:", email);
                return res
                    .status(401)
                    .json({ message: "Invalid email or password." });
            }

            const user = userResult.rows[0];

            // ตรวจสอบรหัสผ่าน
            const passwordMatch = await bcrypt.compare(password, user.HashPassword); // Changed user.hashpassword to user.HashPassword

            if (!passwordMatch) {
                console.log("Incorrect password for:", email);
                return res
                    .status(401)
                    .json({ message: "Invalid email or password." });
            }

            // แปลง Role ให้เป็น lowercase เพื่อให้ตรงกับที่ frontend คาดหวัง
            let clientRole = user.Role.toLowerCase(); // Changed user.role to user.Role

            console.log("Login successful for:", email, "Role:", user.Role); // Changed user.role to user.Role

            res.status(200).json({ role: clientRole, email: user.Email }); // Changed user.email to user.Email

        } catch (error) {
            console.error("Login database error", error);
            res
                .status(500)
                .json({ message: "Login failed due to server error." });
        }
    });

    return router;
};