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

import { authMiddleware } from '../controllers/authMiddleware.js ';
import { getDashboardStats } from '../controllers/analyticsController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);

router.get('/verify', verifyUser); 

router.get('/', authMiddleware, getAllUsers);
router.get('/profile', authMiddleware, getUserProfile);

router.put('/profile', authMiddleware, updateUserProfile);
router.put('/role/:id', authMiddleware, updateUser);

router.delete('/:id',authMiddleware,deleteUser);

router.get('/wishlist', authMiddleware, getWishlist);
router.post('/wishlist', authMiddleware, addToWishlist);
router.delete('/wishlist/:productId', authMiddleware, removeFromWishlist);

router.get('/dashboard', authMiddleware, getDashboardStats);

export default router;

