import mongoose from 'mongoose';

const ContactMessageSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: [true, 'Please provide your full name'],
        trim: true,
    },
    
    email: {
        type: String,
        required: [true, 'Please provide your email address'],
        match: [
            /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 
            'Please enter a valid email address'
        ],
        lowercase: true,
    },
    
    message: {
        type: String,
        required: [true, 'Message cannot be empty'],
    },
    
    isHandled: {
        type: Boolean,
        default: false,
    },
}, {
    
    timestamps: true, 
});


const ContactMessage = mongoose.model('ContactMessage', ContactMessageSchema);

export default ContactMessage;