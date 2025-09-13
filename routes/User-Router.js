import express from 'express';
import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    deleteUser,
    updateUser,
} from '../controllers/User-Controller.js';
// Corrected path and import type for the middleware
import { authMiddleware } from '../controllers/authMiddleware.js ';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes - these require a valid token
router.get('/', authMiddleware, getUserProfile);
router.get('/profile', authMiddleware, getUserProfile);


router.put('/profile', authMiddleware, updateUserProfile);
router.put('/role/:id', authMiddleware, updateUser);



router.delete('/:id',authMiddleware,deleteUser);


export default router;

