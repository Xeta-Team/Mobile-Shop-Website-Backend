import express from 'express';
import { placeOrder, getUserOrders, getAllOrders, updateOrderStatus, updateTrackingNumber } from '../controllers/Order-Controller.js'; 
import { adminMiddleware } from '../controllers/adminMiddleware.js'; 
import { authMiddleware } from '../controllers/authMiddleware.js';

const orderRouter = express.Router();

// --- USER ROUTES ---
// These routes are for individual logged-in users
orderRouter.post('/', authMiddleware, placeOrder);
orderRouter.get('/myorders', authMiddleware, getUserOrders);

// --- ADMIN ROUTES ---
// These routes are protected and can only be accessed by admins
orderRouter.get('/', authMiddleware, adminMiddleware, getAllOrders);
orderRouter.put('/:id/status', authMiddleware, adminMiddleware, updateOrderStatus);
orderRouter.put('/:id/tracking', authMiddleware, adminMiddleware, updateTrackingNumber);

export default orderRouter;

