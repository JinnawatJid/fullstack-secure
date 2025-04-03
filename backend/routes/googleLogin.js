const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET;

module.exports = (dbPool) => {
  router.post('/', async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Google ID token is required.' });
    }

    const client = new OAuth2Client(CLIENT_ID);

    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: CLIENT_ID,
      });
      const payload = ticket.getPayload();
      console.log("Google ID token payload:", payload);
      const googleEmail = payload['email'];
      const googleUserId = payload['sub']; // Unique Google ID

      // Check if the user already exists in your database based on the Google email
      const result = await dbPool.query(
        'SELECT * FROM public."google_user" WHERE "email" = $1',
        [googleEmail]
      );
      const user = result.rows[0];

      if (user) {
        // User exists, generate a JWT for them
        const token = jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: '1h' }
        );
        return res.status(200).json({ message: 'Google sign-in successful', token });
      } else {
        
        // User does not exist, create a new user in database
        try {
          const insertResult = await dbPool.query(
            'INSERT INTO public."google_user" ("email", "google_id", "role") VALUES ($1, $2, $3) RETURNING id, email, role',
            [googleEmail, googleUserId, 'Member'] // Default role
          );
          const newUser = insertResult.rows[0];

          const token = jwt.sign(
            { userId: newUser.id, email: newUser.email, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '1h' }
          );
          return res.status(201).json({ message: 'Google sign-up successful', token });
        } catch (dbError) {
          console.error('Error creating new user:', dbError);
          return res.status(500).json({ message: 'Error creating user.' });
        }
      }
    } catch (error) {
      console.error('Error verifying Google ID token:', error);
      return res.status(401).json({ message: 'Invalid Google ID token.' });
    }
  });

  return router;
};