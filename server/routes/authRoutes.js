const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route   POST /api/auth/google
// @desc    Auth user with Google and get token
// @access  Public
router.post('/google', async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { name, email, picture, sub: googleId } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (user) {
            // Update user info if needed
            user.name = name;
            user.profilePicture = picture;
            user.googleId = googleId;
            await user.save();
        } else {
            // Check if this is the FIRST user? Maybe we make the first user admin manually or handled in seeding.
            // For now, default is MEMBER.
            user = await User.create({
                name,
                email,
                googleId,
                profilePicture: picture,
                role: 'MEMBER' 
            });
        }

        const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        res.cookie('token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture
        });

    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Google Auth Failed' });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user / clear cookie
// @access  Public
router.post('/logout', (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

// @route   GET /api/auth/me
// @desc    Get current user profile (using cookie)
// @access  Private
const { protect } = require('../middleware/auth');
router.get('/me', protect, async (req, res) => {
    res.json(req.user);
});

module.exports = router;
