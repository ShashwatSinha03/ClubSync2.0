const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');
const { sendApprovalEmail } = require('../utils/emailService');

// @route   GET /api/admin/pending-users
// @desc    Get all users with PENDING status
// @access  Private/Admin
router.get('/pending-users', protect, admin, async (req, res) => {
    try {
        const pendingUsers = await User.find({ accountStatus: 'PENDING' })
            .select('-password')
            .sort({ createdAt: -1 });
        
        res.json(pendingUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/users
// @desc    Get all active users (for role management)
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
    try {
        const users = await User.find({ accountStatus: 'APPROVED' })
            .select('-password')
            .sort({ name: 1 });
        
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/admin/reject-user/:userId
// @desc    Reject (delete) a pending user
// @access  Private/Admin
router.delete('/reject-user/:userId', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.accountStatus === 'APPROVED') {
            return res.status(400).json({ message: 'Cannot reject an already approved user' });
        }

        await User.deleteOne({ _id: user._id });

        res.json({ message: 'User rejected and removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/admin/approve-user/:userId
// @desc    Approve a pending user
// @access  Private/Admin
router.post('/approve-user/:userId', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.accountStatus === 'APPROVED') {
            return res.status(400).json({ message: 'User is already approved' });
        }

        user.accountStatus = 'APPROVED';
        await user.save();

        // Send approval email (Non-blocking)
        sendApprovalEmail(user.email, user.name);

        res.json({
            message: 'User approved successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                accountStatus: user.accountStatus
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admin/role
// @desc    Promote or Demote a user (Admin/Member)
// @access  Private/Admin
router.put('/role', protect, admin, async (req, res) => {
    const { userId, role } = req.body;

    if (!['ADMIN', 'MEMBER'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    try {
        // Prevent demoting self
        if (userId === req.user._id.toString() && role === 'MEMBER') {
            return res.status(400).json({ message: 'You cannot demote yourself.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.role = role;
        await user.save();

        res.json({
            message: `User role updated to ${role}`,
            user: {
                _id: user._id,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
