const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const { protect } = require('../middleware/auth');

// @route   GET /api/users/activity
// @desc    Get current user's activity stats (Attended, Missed, Upcoming)
// @access  Private
router.get('/activity', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();

        // Fetch user's RSVPs and all events for attendance check
        const rsvps = await RSVP.find({ userId });
        
        // Fetch events
        const allEvents = await Event.find().sort({ dateTime: 1 });

        const history = allEvents.map(event => {
            const eventDate = new Date(event.dateTime);
            const rsvp = rsvps.find(r => r.eventId.toString() === event._id.toString());
            
            // Find the user's status in the event's attendance array
            const attendRecord = (event.attendance || []).find(a => a.userId.toString() === userId.toString());
            const userAttendanceStatus = attendRecord ? attendRecord.status : 'NONE';

            let status = 'NONE';

            if (userAttendanceStatus === 'PRESENT') {
                status = 'ATTENDED';
            } else if (eventDate < now) {
                if (rsvp && rsvp.status === 'GOING' && userAttendanceStatus !== 'PRESENT') {
                    status = 'MISSED';
                } else if (userAttendanceStatus !== 'NONE') {
                    status = 'PAST';
                }
            } else {
                if (rsvp && rsvp.status === 'GOING') {
                    status = 'UPCOMING';
                }
            }

            return {
                _id: event._id,
                title: event.title,
                type: event.type,
                dateTime: event.dateTime,
                status
            };
        });

        // Filter for relevant history
        const relevantHistory = history.filter(h => ['ATTENDED', 'MISSED', 'UPCOMING'].includes(h.status));

        // Calculate Stats
        // totalPast: Count of events where this user was expected to be (i.e., in the attendance snapshot)
        const userEventsMatching = allEvents.filter(e => 
            (e.attendance || []).some(a => a.userId.toString() === userId.toString()) && 
            new Date(e.dateTime) < now
        );
        
        const attendedCount = history.filter(h => h.status === 'ATTENDED').length;
        const missedCount = history.filter(h => h.status === 'MISSED').length;
        const totalPast = userEventsMatching.length;

        res.json({
            memberSince: req.user.createdAt,
            stats: {
                attended: attendedCount,
                totalPast: totalPast,
                missed: missedCount
            },
            history: relevantHistory.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
