import mongoose from "mongoose";
import User from "../model/user_model.js";
import generateToken from '../utils/generateToken.js';
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                success: false,
                message: 'Database not connected. Please ensure your current IP address is whitelisted in MongoDB Atlas Network Access.'
            });
        }

        const { fullName, email, password, phone } = req.body;
        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({ success: false, message: 'All fields mandatory' });
        }
        
        const phoneStr = String(phone).trim();

        if (password.length < 6 || fullName.length < 3) {
            return res.status(400).json({ success: false, message: "Field length requirements not met" });
        }
        const userExists = await User.findOne({ $or: [{ fullName }, { email }, { phone: phoneStr }] });
        if (userExists) {
            return res.status(409).json({ success: false, message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({ fullName, email, phone: phoneStr, password: hashedPassword });

        const userResponse = user.toObject();
        delete userResponse.password;

        generateToken(res, user._id);
        return res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            customer: userResponse,
            user: userResponse
        });
    } catch (error) {
        console.error('Registration Error: ', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'User with this email, phone, or name already exists' });
        }
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

export const loginUser = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                success: false,
                message: 'Database not connected. Please ensure your current IP address is whitelisted in MongoDB Atlas Network Access.'
            });
        }

        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        generateToken(res, user._id);
        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: userResponse,
            customer: userResponse
        });
    } catch (error) {
        console.error('Internal Server Error: ', error);
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};

export const logoutUser = async (req, res) => {
    try {
        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0),
            sameSite: 'lax',
            path: '/',
            secure: process.env.NODE_ENV === 'production'
        });
        return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error('Internal Server Error: ', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getMe = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }

        const userResponse = req.user.toObject ? req.user.toObject() : { ...req.user };
        delete userResponse.password;

        return res.status(200).json({
            success: true,
            user: userResponse,
            ...userResponse
        });
    } catch (error) {
        console.error('Internal Server Error: ', error);
        return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
};
