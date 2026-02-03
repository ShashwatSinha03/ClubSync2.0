const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/', protect, admin, async (req, res) => {
    try {
        const users = await User.find({}).sort({ name: 1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PUT /api/users/profile
// @desc    Update user profile (Self)
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.instrument = req.body.instrument || user.instrument;
            user.phone = req.body.phone || user.phone;
            const updated = await user.save();
            res.json(updated);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/users/stats/:id
// @desc    Get member attendance stats
// @access  Private
router.get('/stats/:id', protect, async (req, res) => {
    try {
        const userId = req.params.id;
        // Total events that have passed
        const totalPastEvents = await Event.countDocuments({ date: { $lt: new Date() } });
        
        // Events where user was present
        const attendedEvents = await Event.countDocuments({
            date: { $lt: new Date() },
            'attendance.user': userId,
            'attendance.status': 'PRESENT'
        });

        const rsvps = await Event.find({
            'rsvpList.user': userId
        }, 'title date rsvpList');

        res.json({
            attendedEvents,
            totalPastEvents,
            attendancePercentage: totalPastEvents > 0 ? (attendedEvents / totalPastEvents) * 100 : 0,
            rsvpHistory: rsvps.map(e => ({
                eventId: e._id,
                title: e.title,
                date: e.date,
                status: e.rsvpList.find(r => r.user.toString() === userId.toString()).status
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
