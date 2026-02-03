const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/events
// @desc    Get all events
// @access  Private (Members)
router.get('/', protect, async (req, res) => {
    try {
        const events = await Event.find({})
            .sort({ date: 1 })
            .populate('createdBy', 'name')
            .populate('rsvpList.user', 'name profilePicture')
            .populate('attendance.user', 'name profilePicture');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/events
// @desc    Create an event
// @access  Private (Admin)
router.post('/', protect, admin, async (req, res) => {
    const { title, type, date, location, notes } = req.body;

    try {
        const event = new Event({
            title,
            type,
            date,
            location,
            notes,
            createdBy: req.user._id
        });

        const createdEvent = await event.save();
        res.status(201).json(createdEvent);
    } catch (error) {
        res.status(400).json({ message: 'Invalid event data' });
    }
});

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Private (Admin)
router.put('/:id', protect, admin, async (req, res) => {
    const { title, type, date, location, notes } = req.body;

    try {
        const event = await Event.findById(req.params.id);

        if (event) {
            event.title = title || event.title;
            event.type = type || event.type;
            event.date = date || event.date;
            event.location = location || event.location;
            event.notes = notes || event.notes;

            const updatedEvent = await event.save();
            res.json(updatedEvent);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(404).json({ message: 'Event not found' });
    }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Private (Admin)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (event) {
            await event.deleteOne();
            res.json({ message: 'Event removed' });
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/events/:id/rsvp
// @desc    RSVP for an event
// @access  Private (Members)
router.post('/:id/rsvp', protect, async (req, res) => {
    const { status } = req.body; // GOING, MAYBE, NOT_GOING

    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const rsvpIndex = event.rsvpList.findIndex(r => r.user.toString() === req.user._id.toString());

        if (rsvpIndex !== -1) {
            event.rsvpList[rsvpIndex].status = status;
        } else {
            event.rsvpList.push({ user: req.user._id, status });
        }

        await event.save();
        res.json({ message: 'RSVP updated successfully', rsvpList: event.rsvpList });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @route   POST /api/events/:id/attendance
// @desc    Mark attendance for an event (Admin)
// @access  Private (Admin)
router.post('/:id/attendance', protect, admin, async (req, res) => {
    const { userId, status } = req.body; //userId and status: PRESENT, ABSENT, LATE

    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const attendanceIndex = event.attendance.findIndex(a => a.user.toString() === userId.toString());

        if (attendanceIndex !== -1) {
            event.attendance[attendanceIndex].status = status;
        } else {
            event.attendance.push({ user: userId, status });
        }

        await event.save();
        res.json({ message: 'Attendance updated successfully', attendance: event.attendance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
