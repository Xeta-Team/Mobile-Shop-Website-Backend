import express from 'express';
import { registerUser } from '../controllers/User-Controller.js';

let userRouter = express.Router();

userRouter.post('/', registerUser);

export default userRouter;