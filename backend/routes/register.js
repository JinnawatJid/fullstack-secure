const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

module.exports = (dbPool) => {
  router.post("/", async (req, res) => {
    const { username, password, role } = req.body;

    console.log("Registration attempt for:", username, "Role:", role);

    if (!username || !password || !role) {
      return res
        .status(400)
        .json({ message: "Username, password, and role are required." });
    }

    try {
      const userCheckResult = await dbPool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      if (userCheckResult.rows.length > 0) {
        return res
          .status(409)
          .json({
            message:
              "Username already taken. Please choose a different username.",
          });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const insertResult = await dbPool.query(
        "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *",
        [username, hashedPassword, role]
      );

      const newUser = insertResult.rows[0];

      console.log(
        "Registration successful for:",
        newUser.username,
        "Role:",
        newUser.role,
        "ID:",
        newUser.id
      );
      res
        .status(201)
        .json({
          message: "User registered successfully!",
          user: { username: newUser.username, role: newUser.role },
        });
    } catch (error) {
      console.error("Registration database error", error);
      return res
        .status(500)
        .json({ message: "Registration failed due to server error." });
    }
  });

  return router;
};
