import express from 'express';
import User from '../models/User-Regestration-model.js';
import bcrypt from 'bcrypt';



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