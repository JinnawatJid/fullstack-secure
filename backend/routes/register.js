const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

module.exports = (dbPool) => {
  router.post("/", (req, res) => {
    const { email, password, role } = req.body;

    // แปลงค่า role ให้ตรงกับ ENUM ในฐานข้อมูล
    let dbRole;
    switch (role) {
      case 'admin':
        dbRole = 'Admin';
        break;
      case 'seller': // ใช้ 'seller' แทน 'manager' ตามที่มีในฐานข้อมูล
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

    // ตรวจสอบว่า email มีอยู่แล้วหรือไม่
    dbPool.query(
      "SELECT * FROM User WHERE Email = ?",
      [email],
      (error, rows) => {
        if (error) {
          console.error("Error checking email:", error);
          return res
            .status(500)
            .json({ message: "Registration failed due to server error." });
        }

        if (rows.length > 0) {
          return res
            .status(409)
            .json({
              message: "Email already taken. Please choose a different email.",
            });
        }

        // ทำการ hash รหัสผ่าน
        bcrypt.hash(password, 10, (hashError, hashedPassword) => {
          if (hashError) {
            console.error("Error hashing password:", hashError);
            return res
              .status(500)
              .json({ message: "Registration failed due to server error." });
          }

          // เพิ่มผู้ใช้ใหม่
          dbPool.query(
            "INSERT INTO User (Email, HashPassword, Role) VALUES (?, ?, ?)",
            [email, hashedPassword, dbRole],
            (insertError, result) => {
              if (insertError) {
                console.error("Error inserting user:", insertError);
                return res
                  .status(500)
                  .json({ message: "Registration failed due to server error." });
              }

              const userId = result.insertId;

              // ดึงข้อมูลผู้ใช้ที่เพิ่งสร้าง
              dbPool.query(
                "SELECT * FROM User WHERE userID = ?",
                [userId],
                (selectError, selectResult) => {
                  if (selectError) {
                    console.error("Error retrieving user:", selectError);
                    return res
                      .status(500)
                      .json({ message: "Registration successful but error retrieving user data." });
                  }

                  const newUser = selectResult[0];

                  console.log(
                    "Registration successful for:",
                    newUser.Email,
                    "Role:",
                    newUser.Role,
                    "ID:",
                    newUser.userID
                  );

                  res.status(201).json({
                    message: "User registered successfully!",
                    user: { email: newUser.Email, role: newUser.Role },
                  });
                }
              );
            }
          );
        });
      }
    );
  });

  return router;
};