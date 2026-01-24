const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/events
// @desc    Get all events
// @access  Private (Members)
router.get('/', protect, async (req, res) => {
    try {
        // Sort by date ascending (upcoming first)
        const events = await Event.find({}).sort({ date: 1 });
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

module.exports = router;
