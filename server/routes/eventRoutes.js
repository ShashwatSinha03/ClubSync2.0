const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const Attendance = require('../models/Attendance');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/events
// @desc    Get all events (Upcoming and Past)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const events = await Event.find().sort({ dateTime: 1 });
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/events
// @desc    Create a new event
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    const { title, type, dateTime, location, notes } = req.body;

    if (!title || !type || !dateTime || !location) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        const event = await Event.create({
            title,
            type,
            dateTime,
            location,
            notes
        });

        res.status(201).json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/events/:id
// @desc    Get single event with RSVP status and Attendance
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const rsvp = await RSVP.findOne({ eventId: event._id, userId: req.user._id });
        
        let attendance = null;
        if (req.user.role === 'ADMIN') {
            // Fetch all approved members
            const User = require('../models/User');
            const members = await User.find({ accountStatus: 'APPROVED', role: 'MEMBER' }).select('name instrument');
            
            // Fetch existing attendance records
            const records = await Attendance.find({ eventId: event._id });
            
            // Merge members with their records
            attendance = members.map(member => {
                const record = records.find(r => r.userId.toString() === member._id.toString());
                return {
                    userId: member,
                    present: record ? record.present : false,
                    hasRecord: !!record
                };
            });
        } else {
            attendance = await Attendance.findOne({ eventId: event._id, userId: req.user._id });
        }

        res.json({
            event,
            rsvp: rsvp ? rsvp.status : null,
            attendance
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/events/:id/rsvp
// @desc    RSVP to an event
// @access  Private
router.post('/:id/rsvp', protect, async (req, res) => {
    const { status } = req.body;
    if (!status || !['GOING', 'NOT_GOING'].includes(status)) {
        return res.status(400).json({ message: 'Invalid RSVP status' });
    }

    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const rsvp = await RSVP.findOneAndUpdate(
            { eventId: event._id, userId: req.user._id },
            { status },
            { upsert: true, new: true }
        );

        res.json(rsvp);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/events/:id/attendance
// @desc    Mark attendance for a user (Admin only)
// @access  Private/Admin
router.post('/:id/attendance', protect, admin, async (req, res) => {
    const { userId, present } = req.body;
    
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Attendance UI appears only after event time
        if (new Date() < new Date(event.dateTime)) {
            return res.status(400).json({ message: 'Cannot mark attendance before event starts' });
        }

        const attendance = await Attendance.findOneAndUpdate(
            { eventId: event._id, userId },
            { present },
            { upsert: true, new: true }
        );

        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
