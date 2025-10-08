import express from 'express';
import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    deleteUser,
    updateUser,
    googleLogin,
    getAllUsers,
    verifyUser,
    getWishlist,      
    addToWishlist,    
    removeFromWishlist 
} from '../controllers/User-Controller.js';
// Corrected path and import type for the middleware
import { authMiddleware } from '../controllers/authMiddleware.js ';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);

// --- NEW PUBLIC ROUTE FOR EMAIL VERIFICATION ---
router.get('/verify', verifyUser); 


// Protected routes - these require a valid token
router.get('/', authMiddleware, getAllUsers);
router.get('/profile', authMiddleware, getUserProfile);


router.put('/profile', authMiddleware, updateUserProfile);
router.put('/role/:id', authMiddleware, updateUser);



router.delete('/:id',authMiddleware,deleteUser);

// --- PROTECTED WISHLIST ROUTES ---
router.get('/wishlist', authMiddleware, getWishlist);
router.post('/wishlist', authMiddleware, addToWishlist);
router.delete('/wishlist/:productId', authMiddleware, removeFromWishlist);

export default router;

