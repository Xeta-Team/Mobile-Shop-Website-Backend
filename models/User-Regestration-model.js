import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the User Schema based on your new structure
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
            required: [true, 'Password is required.'],
            minlength: [8, 'Password must be at least 8 characters long.'],
            select: false, // Hide password from query results by default for security
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
    },
    {
        // Automatically adds createdAt and updatedAt fields
        timestamps: true,
    }
);

// Mongoose Pre-Save Hook to Hash the Password before saving
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(10);
        // Hash the password with the salt
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare candidate password with the stored hashed password
userSchema.methods.comparePassword = async function(candidatePassword) {
    // 'this.password' is the hashed password from the database
    return await bcrypt.compare(candidatePassword, this.password);
};

// Create the User model from the schema
const User = mongoose.model("User", userSchema);

export default User;

