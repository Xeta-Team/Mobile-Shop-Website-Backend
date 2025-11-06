import express from 'express';
import { placeOrder } from '../controllers/Order-Controller.js';
import { authMiddleware } from '../controllers/authMiddleware.js';

const orderRouter = express.Router();
rs
orderRouter.use(authMiddleware);

orderRouter.post('/', placeOrder);

export default orderRouter;

