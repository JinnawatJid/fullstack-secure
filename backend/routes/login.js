const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');

module.exports = (dbPool) => {
  router.post("/", (req, res) => {
    const { email, password } = req.body;

    console.log("Login attempt for:", "Password:", "******** (hashed)");

    // ค้นหาผู้ใช้ในฐานข้อมูล
    dbPool.query(
      "SELECT * FROM User WHERE Email = ?",
      [email],
      (error, results) => {
        if (error) {
          console.error("Login database error", error);
          return res
            .status(500)
            .json({ message: "Login failed due to server error." });
        }

        // ตรวจสอบว่าพบผู้ใช้หรือไม่
        if (results.length === 0) {
          console.log("User not found in database:", email);
          return res
            .status(401)
            .json({ message: "Invalid email or password." });
        }

        const user = results[0];

        // ตรวจสอบรหัสผ่าน
        bcrypt.compare(
          password,
          user.HashPassword,
          (bcryptError, passwordMatch) => {
            if (bcryptError) {
              console.error("Password comparison error:", bcryptError);
              return res
                .status(500)
                .json({ message: "Login failed due to server error." });
            }

            if (!passwordMatch) {
              console.log("Incorrect password for:", email);
              return res
                .status(401)
                .json({ message: "Invalid email or password." });
            } // แปลง Role ให้เป็น lowercase เพื่อให้ตรงกับที่ frontend คาดหวัง

            let clientRole = user.Role.toLowerCase();

            console.log("Login successful for:", email, "Role:", user.Role);

            res.status(200).json({ role: clientRole, email: user.Email });
          }
        );
      }
    );
  });

  return router;
};
