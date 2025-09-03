import express from 'express';
import User from '../models/User-Regestration-model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';



export function registerUser(req, res) {


    const data = req.body;

    data.password = bcrypt.hashSync(data.password, 10);

    const newUser = new User(data);
    newUser.save().then(
        (result) => 
            {
                res.status(201).json("User registered successfully");
            }).catch(
                
            (err) => {
                res.status(500).json("Error registering user: " + err.message);
            })
        }

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 2. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Check password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 5. Send response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
}



