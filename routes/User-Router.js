import express from 'express';
import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    googleLogin
} from '../controllers/User-Controller.js';
// Corrected path and import type for the middleware
import { authMiddleware } from '../controllers/authMiddleware.js ';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);

// Protected routes - these require a valid token
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);

export default router;

