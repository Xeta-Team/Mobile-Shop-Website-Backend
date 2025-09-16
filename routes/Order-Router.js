import express from 'express';
import { getSpecificUserOrder, placeOrder } from '../controllers/Order-Controller.js';
import { authMiddleware } from '../controllers/authMiddleware.js';

const orderRouter = express.Router();

orderRouter.use(authMiddleware);

orderRouter.post('/', placeOrder);
orderRouter.get('/', getSpecificUserOrder);

export default orderRouter;

