const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/events
// @desc    Get all events (Upcoming and Past)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const events = await Event.find().sort({ dateTime: 1 }).lean();
        
        // Enrich events with RSVP data
        const enrichedEvents = await Promise.all(events.map(async (event) => {
            const rsvps = await RSVP.find({ eventId: event._id });
            const attendingUsers = rsvps.filter(r => r.status === 'ATTENDING');
            const notAttendingUsers = rsvps.filter(r => r.status === 'NOT_ATTENDING');
            
            const eventData = {
                ...event,
                attendingCount: attendingUsers.length,
                userRsvp: rsvps.find(r => r.userId.toString() === req.user._id.toString())?.status || null
            };

            if (req.user.role === 'ADMIN') {
                // Populate user details for the lists
                const populatedAttending = await RSVP.populate(attendingUsers, { path: 'userId', select: 'name instrument' });
                const populatedNotAttending = await RSVP.populate(notAttendingUsers, { path: 'userId', select: 'name instrument' });
                
                eventData.rsvpList = {
                    attending: populatedAttending.map(r => r.userId),
                    notAttending: populatedNotAttending.map(r => r.userId)
                };
            }
            
            return eventData;
        }));

        res.json(enrichedEvents);
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
        const User = require('../models/User');
        const approvedMembers = await User.find({ accountStatus: 'APPROVED' }).select('_id');
        
        const attendanceSnapshot = approvedMembers.map(member => ({
            userId: member._id,
            status: 'PENDING'
        }));

        const event = await Event.create({
            title,
            type,
            dateTime,
            location,
            notes,
            attendance: attendanceSnapshot
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
            // Return full attendance snapshot with user details
            await event.populate('attendance.userId', 'name instrument');
            attendance = event.attendance;
        } else {
            // Return only the current user's attendance status
            const userRecord = event.attendance.find(a => a.userId.toString() === req.user._id.toString());
            attendance = userRecord ? userRecord.status : 'PENDING';
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
    if (!status || !['ATTENDING', 'NOT_ATTENDING'].includes(status)) {
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
        const { userId, status } = req.body;
    
    if (!status || !['PRESENT', 'ABSENT', 'PENDING'].includes(status)) {
        return res.status(400).json({ message: 'Invalid attendance status' });
    }
    
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Attendance UI usually appears after or near event time, but per spec:
        // "Admin can update anytime."

        const memberRecord = event.attendance.find(a => a.userId.toString() === userId.toString());
        if (memberRecord) {
            memberRecord.status = status;
        } else {
            // Fallback if member wasn't in snapshot (proactive edge case handling)
            event.attendance.push({ userId, status });
        }

        await event.save();
        res.json({ userId, status });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
