const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const validatePassword = require("../utils/passwordValidator");

module.exports = (dbPool) => {
  router.post("/", async (req, res) => {
    const { email, password, role } = req.body;

    console.log("Registration attempt for:", email, "Role:", role);

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Username, password, and role are required." });
    }

    const passwordErrors = validatePassword(password);

    if (passwordErrors.length > 0) {
      console.log("Password errors:");
      console.log(passwordErrors.join("\n"));
      return res.status(400).json({ message: passwordErrors.join(" ") });
    }

    try {
      const userCheckQuery = 'SELECT * FROM public."user" WHERE "email" = $1';
      const userCheckResult = await dbPool.query(userCheckQuery, [email]);

      if (userCheckResult.rows.length > 0) {
        console.log("email already taken. Please choose a different email.");
        return res.status(409).json({
          message: "email already taken. Please choose a different email.",
        });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const insertUserQuery =
        'INSERT INTO public."user" ("email", "hashpassword", "role") VALUES ($1, $2, $3) RETURNING *';
      const insertResult = await dbPool.query(insertUserQuery, [
        email,
        hashedPassword,
        role,
      ]);

      const newUser = insertResult.rows[0];

      console.log(
        "Registration successful for:",
        newUser.email,
        "Role:",
        newUser.role
      );
      res.status(201).json({
        message: "User registered successfully!",
        user: { email: newUser.email, role: newUser.role },
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