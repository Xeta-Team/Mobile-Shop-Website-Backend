import jwt from 'jsonwebtoken';
import User from '../models/User-Regestration-model.js';

export const authMiddleware = async (req, res, next) => {
    let token;

    console.log('Auth middleware hit. Headers:', req.headers.authorization); // Log incoming header

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('Token extracted:', token); // Log the extracted token

            // Verify the token using the secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token decoded successfully:', decoded); // Log the decoded payload

            // Find the user by the ID from the token's payload
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                console.error('User not found for ID:', decoded.id);
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            console.log('User authenticated successfully:', req.user.username);
            next(); // Proceed to the protected route
        } catch (error) {
            // Log the specific type of JWT error
            console.error('Token verification failed:', error.name, '-', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        // This block will run if the header is missing or in the wrong format
        if (!token) {
            console.error('No token found in headers.');
            res.status(401).json({ message: 'Not authorized, no token provided' });
        }
    }
};
