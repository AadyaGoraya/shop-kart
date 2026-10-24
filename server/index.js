import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import userRoutes from './routes/user_routes.js';
import productRoutes from './routes/product_routes.js';
import wishlistRoutes from './routes/wishlist_routes.js';
import cartRoutes from './routes/cart_routes.js';
import orderRoutes from './routes/order_routes.js';

dotenv.config()
const app = express();
const port = process.env.port || process.env.PORT || 320;

app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        server: 'online',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Middleware to verify database connection before processing database routes
app.use((req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            success: false,
            message: 'Database connection failed. Please ensure your current IP address is whitelisted in MongoDB Atlas Network Access.'
        });
    }
    next();
});

// API Routes
app.use('/user', userRoutes);
app.use('/customers', userRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.dbURL, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('Error in connecting to DB:', error.message);
        console.log('Retrying MongoDB connection in 5 seconds (Make sure your current IP address is whitelisted in MongoDB Atlas)...');
        setTimeout(connectDB, 5000);
    }
};

connectDB();