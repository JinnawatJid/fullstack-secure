const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const loginLimiter = require("../utils/rateLimiter");

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET;

module.exports = (dbPool) => {
  router.post(
    "/",
    /*loginLimiter*/ async (req, res) => {
      const { email, password } = req.body;

      console.log("Login attempt for:", email);

      try {
        const result = await dbPool.query(
          'SELECT * FROM public."user" WHERE "email" = $1',
          [email]
        );
        const user = result.rows[0];

        if (!user) {
          console.log("email not found in database:", email);
          return res
            .status(401)
            .json({ message: "Invalid email or password." });
        }

        const passwordMatch = await bcrypt.compare(password, user.hashpassword);

        if (!passwordMatch) {
          console.log("Incorrect password for:", email);
          return res
            .status(401)
            .json({ message: "Invalid email or password." });
        }

        console.log("Login successful for:", email, "Role:", user.role);

        // Generate JWT
        const token = jwt.sign(
          { userId: user.id, email: user.email, role: user.role }, // Payload
          JWT_SECRET, // Secret key
          { expiresIn: "1h" } // Token expiration time
        );

        res.status(200).json({
          message: "Login successful",
          token: token,
          role: user.role,
        });
      } catch (error) {
        console.error("Login database error", error);
        return res
          .status(500)
          .json({ message: "Login failed due to server error." });
      }
    }
  );

  return router;
};
