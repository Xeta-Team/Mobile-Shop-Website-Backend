import User from '../models/User-Regestration-model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from "google-auth-library";
import crypto from 'crypto'; 
import nodemailer from 'nodemailer'; 


// --- NEW FUNCTION: Email Sender (Requires environment variables) ---
const sendEmail = async ({ to, subject, html }) => {
    // --- ENHANCEMENT: Check for required environment variables ---
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("EMAIL CONFIGURATION ERROR: EMAIL_USER or EMAIL_PASS is missing in environment variables. Cannot proceed with Nodemailer.");
        // Throw an error that registerUser can catch
        throw new Error('Email service configuration missing. Cannot send verification email.'); 
    }
    // --- END ENHANCEMENT ---

    try {
        // Create a transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Standard service name for Gmail
            auth: {
                user: process.env.EMAIL_USER, // Your email address (requires App Password)
                pass: process.env.EMAIL_PASS  // Your App Password
            },
            // Added timeout to prevent infinite hanging
            timeout: 15000, 
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL SENT] Message ID: ${info.messageId}`);
    } catch (error) {
        // Log the actual nodemailer/SMTP error (e.g., Authentication failure)
        console.error("🚨 CRITICAL NODEMAILER ERROR 🚨:", error.message, 
                      "Check your EMAIL_USER and EMAIL_PASS (must be a Google App Password).");
        // CRITICAL: Throwing the error here ensures registration fails if the email cannot be sent.
        throw new Error('Failed to send verification email. Please check server configuration and credentials.'); 
    }
}; 
// --- END NEW FUNCTION ---


// --- Updated registerUser to include verification logic ---
export const registerUser = async (req, res) => {
    const { username, firstName, lastName, email, password } = req.body;

    try {
        const userExists = await User.findOne({ $or: [{ email }, { username }] });

        if (userExists) {
            // Check if existing user is unverified and give them an option to resend later
            if (!userExists.isVerified) {
                 return res.status(409).json({ message: 'User exists but is not verified. Check your inbox.' });
            }
            return res.status(409).json({ message: 'Username or email already exists.' });
        }
        
        // 1. Generate unique verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        // Token expires in 24 hours
        const verificationTokenExpires = Date.now() + 24 * 3600 * 1000; 

        const newUser = new User({
            username,
            firstName,
            lastName,
            email,
            password,
            isVerified: false, // Explicitly set to false
            verificationToken,
            verificationTokenExpires,
        });

        // Save the user first (without verification)
        await newUser.save();

        // 2. Send the verification email
        // IMPORTANT: Replace 'http://localhost:3001' with your actual deployed domain base URL (BASE_URL)
        const verificationURL = `${process.env.BASE_URL || 'http://localhost:3001'}/api/users/verify?token=${verificationToken}`; 
        
        try {
            await sendEmail({
                to: newUser.email,
                subject: 'Verify Your Account',
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #1a1a1a;">Account Verification Required</h2>
                        <p>Hello ${newUser.firstName},</p>
                        <p>Thank you for registering. Please click the button below to verify your email address and activate your account:</p>
                        <a href="${verificationURL}" 
                           style="display: inline-block; padding: 12px 25px; margin: 15px 0; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;"
                           target="_blank"
                        >
                            Verify Account
                        </a>
                        <p>This verification link will expire in 24 hours.</p>
                        <p style="font-size: 0.9em; color: #777;">If you did not request this, please ignore this email.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 20px;">
                        <p style="font-size: 0.8em; color: #999;">If the button above doesn't work, copy and paste this link into your browser: <br><a href="${verificationURL}" style="color: #000;">${verificationURL}</a></p>
                    </div>
                `
            });

            res.status(201).json({ 
                message: 'User registered successfully! Please check your email to verify your account.' 
            });

        } catch (emailError) {
            // 3. CRITICAL ROLLBACK: If email sending fails, delete the partially created user record
            console.error("Email sending failed. Rolling back user creation:", newUser._id);
            await User.findByIdAndDelete(newUser._id);
            
            // Return an appropriate error message to the client
            res.status(503).json({ 
                message: 'Registration failed: Could not send verification email. Please try again later or contact support.' 
            });
        }


    } catch (error) {
        console.error("Registration/Database Error:", error);
        // This catches MongoDB/Mongoose errors (e.g., validation, password hashing)
        res.status(500).json({ message: error.message || 'Error registering user due to server/database issue.' });
    }
};

// --- Controller Function for Email Verification ---
export const verifyUser = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: 'Verification token is missing.' });
    }

    try {
        const user = await User.findOne({ 
            verificationToken: token, 
            verificationTokenExpires: { $gt: Date.now() } // Check token is not expired
        });

        if (!user) {
            // Redirect to a frontend page indicating failure
            // Redirecting to /verification-status for error messages is helpful for debugging/user context
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/verification-status?status=error&message=Invalid or expired verification link.`);
        }

        // 1. Update user status
        user.isVerified = true;
        user.verificationToken = undefined; // Clear token after use
        user.verificationTokenExpires = undefined;

        await user.save();

        // 2. Redirect to the homepage (/) after successful verification, as requested.
        // NOTE: The user will land on the root path (/). They may need to manually log in 
        // unless you implement auto-login upon verification in the future.
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/`);


    } catch (error) {
        console.error("Verification Error:", error);
        // Redirect on server error
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/verification-status?status=error&message=Internal server error during verification.`);
    }
};
// --- END Controller Function ---


export const googleLogin = async(req, res) => {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  try {
      const { googleToken } = req.body;

      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const { email, given_name, family_name } = payload;

      // Check if user exists in DB
      let user = await User.findOne({ email: email });

      // If user does not exist, create a new one
      if (!user) {
        // Create a username from the email or name
        const username = email.split('@')[0] + Math.floor(100 + Math.random() * 900);
        
        user = new User({
            firstName: given_name,
            lastName: family_name,
            email: email,
            username: username,
            isVerified: true, // Google accounts are implicitly verified
        });
        await user.save();
      }

      // Generate a JWT for the user (whether they are new or existing)
      const token = jwt.sign(
      {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
    } catch (err) {
      console.error("Google login error:", err);
      res.status(400).json({ message: "Invalid Google token or server error" });
    }
}

// --- Updated loginUser to block unverified users ---
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // --- VERIFICATION CHECK ---
    if (!user.isVerified) {
        return res.status(403).json({ 
            message: "Account not verified. Please check your email for the verification link." 
        });
    }
    // --- END VERIFICATION CHECK ---

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

export const getAllUsers = async(req, res) => {
  try{
    const allUsers = await User.find()

    res.status(200).json(allUsers)
  }catch(error){
    res.json({
      message : "Internal Server Error"
    })
  }
}

export const getUserProfile = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized. User information is missing.' });
  }
  
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
};

export const updateUserProfile = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized. User information is missing.' });
  }

  try {
    const user = await User.findById(req.user.id);
  
    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.number = req.body.phone || user.number;
      user.address = req.body.address || user.address;
      const updatedUser = await user.save();

      res.json({
        message: 'Profile updated successfully!',
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

export async function deleteUser(req,res)
{
    try{
        const { id } = req.params;

        const deletedUser = await User.findByIdAndDelete(id);

        if(!deletedUser){
            return res.status(404).json({ "message":"Product not found", deletedUser });
        } 

        res.status(200).json({ message: "Deleted succesfully "});
        }catch{

            console.error("Error deleting product");
            res.status(500).json({ error : "Internal server error" });

    }
    
    
}

export async function updateUser(req, res)
{
    const { id } = req.params; 
    const data = req.body;

    try{
      const user = await User.findById(id)
    
      user.role = data.role
      user.save()

      res.json({    
                "message" : "user updated successfully",
                "product" : result
      })
      }catch(error){
        res.json({
                "message": "An error occured"
        })
      }
}

/**
 * @description Get the logged-in user's wishlist
 * @route GET /api/users/wishlist
 * @access Private
 */
export const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({
                path: 'wishlist',
                populate: { path: 'variants' } // Also populate variants to get price info
            });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching wishlist.' });
    }
};

/**
 * @description Add a product to the user's wishlist
 * @route POST /api/users/wishlist
 * @access Private
 */
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        // Use $addToSet to prevent duplicate entries
        await User.findByIdAndUpdate(req.user.id, {
            $addToSet: { wishlist: productId }
        });
        res.status(200).json({ message: 'Product added to wishlist.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error while adding to wishlist.' });
    }
};

/**
 * @description Remove a product from the user's wishlist
 * @route DELETE /api/users/wishlist/:productId
 * @access Private
 */
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        // Use $pull to remove the item from the array
        await User.findByIdAndUpdate(req.user.id, {
            $pull: { wishlist: productId }
        });
        res.status(200).json({ message: 'Product removed from wishlist.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error while removing from wishlist.' });
    }
};