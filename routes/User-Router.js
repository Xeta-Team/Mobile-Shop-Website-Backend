import express from 'express';
import { registerUser, loginUser } from '../controllers/User-Controller.js';

let userRouter = express.Router();

userRouter.post('/', registerUser);
userRouter.post('/login', loginUser);


export default userRouter;