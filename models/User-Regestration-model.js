import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required.'],
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required.'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/\S+@\S+\.\S+/, 'Please use a valid email address.'],
        },
        password: {
            type: String,

            minlength: [8, 'Password must be at least 8 characters long.'],
            select: false,
        },
        firstName: {
            type: String,
            required: [true, 'First name is required.'],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required.'],
            trim: true,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        number: {
            type: Number,
            default: null,
        },
        address: {
            type: String,
            default: null,
        },
        // --- NEW FIELDS FOR EMAIL VERIFICATION ---
        isVerified: {
            type: Boolean,
            default: false,
        },
        wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product' // Links to your Product model
    }],
    
        verificationToken: {
            type: String,
            default: null,
        },
        verificationTokenExpires: {
            type: Date,
            default: null,
        }
        // --- END NEW FIELDS ---
    },
    {
        timestamps: true,
    }
);

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
