// In Auth-Router.js

import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import User from '../models/User-Regestration-model.js';

const router = express.Router();

router.get('/google/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.redirect(`${process.env.FRONTEND_URL}/register?error=Google-login-failed-no-code`);
    }

    try {
        // --- Step 1: Exchange code for access token ---
        console.log("Step 1: Exchanging authorization code for access token...");
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: `http://localhost:3001/api/auth/google/callback`, // Must match Google Cloud Console
            grant_type: 'authorization_code',


        });

         const userPayload = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
        };
        const { access_token } = tokenResponse.data;
        console.log("Step 1 SUCCESS: Access token received.");

        // --- Step 2: Use access token to get user info ---
        console.log("Step 2: Fetching user profile from Google...");
        const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` },
        });
        const googleUser = userResponse.data;
        console.log("Step 2 SUCCESS: User profile received:", googleUser.email);

        
        
        // --- Step 3: Find or create user in your database ---
        console.log("Step 3: Finding or creating user in database...");
        let user = await User.findOne({ email: googleUser.email });

        if (!user) {
            console.log(`User not found. Creating new user for ${googleUser.email}...`);
            user = new User({
                email: googleUser.email,
                firstName: googleUser.given_name || 'Google',
                lastName: googleUser.family_name || 'User',
                username: googleUser.email,
                password: `google_oauth_${Date.now()}_${Math.random()}`,
            });
            user: userPayload
            await user.save();
            console.log("New user created successfully.");
        } else {
            console.log(`Existing user found for ${googleUser.email}.`);
        }

        // --- Step 4: Create JWT and redirect ---
        console.log("Step 4: Creating JWT and redirecting to frontend...");
        const payload = { id: user._id, username: user.username, email: user.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.redirect(`${process.env.FRONTEND_URL}/user?token=${token}`);

    } catch (error) {
        // This will now show the REAL error from Google
        console.error("--- ERROR DURING GOOGLE OAUTH ---");
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Data:", error.response.data);
            console.error("Status:", error.response.status);
            console.error("Headers:", error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.error("Request:", error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Error Message:", error.message);
        }
        res.redirect(`${process.env.FRONTEND_URL}/register?error=Authentication-failed`);
    }
});

export default router;