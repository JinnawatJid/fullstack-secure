const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

module.exports = (dbPool) => {
  router.post("/", async (req, res) => {
    const { username, password } = req.body;

    console.log(
      "Login attempt for:",
      username,
      "Password:",
      "******** (hashed)"
    );

    try {
      const result = await dbPool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      const user = result.rows[0];

      if (!user) {
        console.log("User not found in database:", username);
        return res
          .status(401)
          .json({ message: "Invalid username or password." });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        console.log("Incorrect password for:", username);
        return res
          .status(401)
          .json({ message: "Invalid username or password." });
      }

      console.log("Login successful for:", username, "Role:", user.role);
      res.status(200).json({ role: user.role, username: user.username });
    } catch (error) {
      console.error("Login database error", error);
      return res
        .status(500)
        .json({ message: "Login failed due to server error." });
    }
  });

  return router;
};
