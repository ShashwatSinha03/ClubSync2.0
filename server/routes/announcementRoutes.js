const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/announcements
// @desc    Get all active announcements
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const announcements = await Announcement.find({ isVisible: true })
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name');
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/announcements
// @desc    Create an announcement (Admin Only)
// @access  Private (Admin)
router.post('/', protect, admin, async (req, res) => {
    const { title, content } = req.body;
    try {
        const announcement = new Announcement({
            title,
            content,
            createdBy: req.user._id
        });
        const created = await announcement.save();
        res.status(201).json(created);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete/Hide an announcement
// @access  Private (Admin)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (announcement) {
            announcement.isVisible = false;
            await announcement.save();
            res.json({ message: 'Announcement hidden' });
        } else {
            res.status(404).json({ message: 'Not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
