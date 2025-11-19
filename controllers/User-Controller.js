import User from '../models/User-Regestration-model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from "google-auth-library";
import crypto from 'crypto'; 
import nodemailer from 'nodemailer'; 
import Order from '../models/Order-model.js';


const sendEmail = async ({ to, subject, html }) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("EMAIL CONFIGURATION ERROR: EMAIL_USER or EMAIL_PASS is missing in environment variables. Cannot proceed with Nodemailer.");
        throw new Error('Email service configuration missing. Cannot send verification email.'); 
    }

    try {
        // Create a transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS  
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
        console.error("🚨 CRITICAL NODEMAILER ERROR 🚨:", error.message, 
                      "Check your EMAIL_USER and EMAIL_PASS (must be a Google App Password).");
        throw new Error('Failed to send verification email. Please check server configuration and credentials.'); 
    }
}; 


export const registerUser = async (req, res) => {
    const { username, firstName, lastName, email, password } = req.body;

    try {
        const userExists = await User.findOne({ $or: [{ email }, { username }] });

        if (userExists) {
            if (!userExists.isVerified) {
                 return res.status(409).json({ message: 'User exists but is not verified. Check your inbox.' });
            }
            return res.status(409).json({ message: 'Username or email already exists.' });
        }
        
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        const verificationTokenExpires = Date.now() + 24 * 3600 * 1000; 

        const newUser = new User({
            username,
            firstName,
            lastName,
            email,
            password,
            isVerified: false, 
            verificationToken,
            verificationTokenExpires,
        });

        await newUser.save();

        const verificationURL = `${import.meta.env.VITE_BACKEND_URL}/api/users/verify?token=${verificationToken}`;
        
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
            console.error("Email sending failed. Rolling back user creation:", newUser._id);
            await User.findByIdAndDelete(newUser._id);
            
            res.status(503).json({ 
                message: 'Registration failed: Could not send verification email. Please try again later or contact support.' 
            });
        }


    } catch (error) {
        console.error("Registration/Database Error:", error);
        res.status(500).json({ message: error.message || 'Error registering user due to server/database issue.' });
    }
};

export const verifyUser = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: 'Verification token is missing.' });
    }

    try {
        const user = await User.findOne({ 
            verificationToken: token, 
            verificationTokenExpires: { $gt: Date.now() } 
        });

        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/verification-status?status=error&message=Invalid or expired verification link.`);
        }

        user.isVerified = true;
        user.verificationToken = undefined; 
        user.verificationTokenExpires = undefined;

        await user.save();

        return res.redirect(`${process.env.FRONTEND_URL}/`);


    } catch (error) {
        console.error("Verification Error:", error);
        
        res.redirect(`${process.env.FRONTEND_URL}/verification-status?status=error&message=Internal server error during verification.`);
    }
};


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

      let user = await User.findOne({ email: email });

      if (!user) {
        const username = email.split('@')[0] + Math.floor(100 + Math.random() * 900);
        
        user = new User({
            firstName: given_name,
            lastName: family_name,
            email: email,
            username: username,
            isVerified: true, 
        });
        await user.save();
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
      console.error("Google login error:", err);
      res.status(400).json({ message: "Invalid Google token or server error" });
    }
}

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
    if (!user.isVerified) {
        return res.status(403).json({ 
            message: "Account not verified. Please check your email for the verification link." 
        });
    }

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
      const [user, totalOrders] = await Promise.all([
        User.findById(req.user.id),
        Order.countDocuments({ user: req.user.id })
      ]);
      
    if (user) {
      const wishlistCount = user.wishlist ? user.wishlist.length : 0;
      res.json({user: user, totalOrders: totalOrders, wishlistCount: wishlistCount});
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


export const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({
                path: 'wishlist',
                populate: { path: 'variants' } 
            });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching wishlist.' });
    }
};


export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        await User.findByIdAndUpdate(req.user.id, {
            $addToSet: { wishlist: productId }
        });
        res.status(200).json({ message: 'Product added to wishlist.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error while adding to wishlist.' });
    }
};


export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        await User.findByIdAndUpdate(req.user.id, {
            $pull: { wishlist: productId }
        });
        res.status(200).json({ message: 'Product removed from wishlist.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error while removing from wishlist.' });
    }
};