const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

// Connect to database
connectDB();

const createAdminUser = async () => {
    try {
        // Check if admin already exists
        const adminExists = await User.findOne({ email: 'sample@rishihood.edu.in' });

        if (adminExists) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            name: 'Sample Admin',
            email: 'sample@rishihood.edu.in',
            password: 'admin123', // CHANGE THIS AFTER FIRST LOGIN
            role: 'ADMIN',
            accountStatus: 'APPROVED',
            instrument: 'Admin'
        });

        console.log('✅ Admin user created successfully');
        console.log('Email: admin@saarang.com');
        console.log('Password: admin123');
        console.log('⚠️  PLEASE CHANGE THE PASSWORD AFTER FIRST LOGIN');
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

createAdminUser();
