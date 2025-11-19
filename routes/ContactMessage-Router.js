import express from 'express';
import { submitContactMessage, getContactMessages } from '../controllers/ContactMessageController.js';

const router = express.Router();

router.post('/', submitContactMessage);

router.get('/', getContactMessages); 

export default router;