import User from '../models/User-Regestration-model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
    const { username, firstName, lastName, email, password } = req.body;

    try {
        const userExists = await User.findOne({ $or: [{ email }, { username }] });

        if (userExists) {
            return res.status(409).json({ message: 'Username or email already exists.' });
        }

        const newUser = new User({
            username,
            firstName,
            lastName,
            email,
            password,
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully!' });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: error.message || 'Error registering user.' });
    }
};

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

export const getUserProfile = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized. User information is missing.' });
  }
  
  try {
    const user = await User.find();
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

const getUsers = () => {
  try{
      const allusers = Use
  }
  catch (erorr) {
    
  }
}

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


