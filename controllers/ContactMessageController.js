import ContactMessage from '../models/ContactMessage.js';
import asyncHandler from 'express-async-handler';

const submitContactMessage = asyncHandler(async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        res.status(400);
        throw new Error('Please fill in all fields (Name, Email, Message).');
    }

    const contactMessage = await ContactMessage.create({
        name,
        email,
        message,
    });

    res.status(201).json({
        success: true,
        message: 'Your message has been successfully sent and recorded.',
        data: {
            id: contactMessage._id,
            name: contactMessage.name,
        }
    });
});

// @desc    Get all contact messages (Admin access)
// @route   GET /api/contact
// @access  Private/Admin
const getContactMessages = asyncHandler(async (req, res) => {

    const messages = await ContactMessage.find({})
        .sort({ createdAt: -1 }); 

    res.status(200).json(messages);
});


export { 
    submitContactMessage,
    getContactMessages 
};