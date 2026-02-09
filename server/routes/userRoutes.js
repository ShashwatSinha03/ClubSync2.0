const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const Attendance = require('../models/Attendance');
const { protect } = require('../middleware/auth');

// @route   GET /api/users/activity
// @desc    Get current user's activity stats (Attended, Missed, Upcoming)
// @access  Private
router.get('/activity', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();

        // Fetch all events
        const events = await Event.find().sort({ dateTime: 1 });

        // Fetch user's RSVPs and Attendance
        const rsvps = await RSVP.find({ userId });
        const attendanceRecords = await Attendance.find({ userId });

        const history = events.map(event => {
            const eventDate = new Date(event.dateTime);
            const rsvp = rsvps.find(r => r.eventId.toString() === event._id.toString());
            const attendance = attendanceRecords.find(a => a.eventId.toString() === event._id.toString());

            let status = 'NONE'; // Default

            if (attendance && attendance.present) {
                status = 'ATTENDED';
            } else if (eventDate < now) {
                if (rsvp && rsvp.status === 'GOING' && (!attendance || !attendance.present)) {
                    status = 'MISSED';
                } else {
                    status = 'PAST'; // Just an older event they didn't interact with
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

        // Calculate summary
        // "Attended X of Y events" (Count past events where type != 'Audition' maybe? Or just all?)
        // Let's count all past events as denominator for simple participation rate?
        // Actually, user requested: "Attended 7 out of the last 10 sessions"
        // Let's just return raw numbers and let frontend format the text?
        // Or return the specific text as requested by "calm summary".

        const attendedCount = history.filter(h => h.status === 'ATTENDED').length;
        const missedCount = history.filter(h => h.status === 'MISSED').length;
        const pastEventsCount = events.filter(e => new Date(e.dateTime) < now).length;
        
        // Filter history to only relevant items for the user (remove 'PAST' where they had no interaction?)
        // "Events attended", "Events RSVPd but missed", "Upcoming events committed to"
        // So we filter out 'PAST' and 'NONE' for the list, but keep numbers for stats.
        
        const relevantHistory = history.filter(h => ['ATTENDED', 'MISSED', 'UPCOMING'].includes(h.status));

        // Sort history: Upcoming first (asc), then Past (desc)
        // Actually, "Ordered by time" rule. 
        // Maybe separate lists? Or just one list.
        // Let's return one list sorted descending? Or Split.
        // Frontend "The People" spec: "Ordered by time".
        
        res.json({
            memberSince: req.user.createdAt,
            stats: {
                attended: attendedCount,
                totalPast: pastEventsCount,
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
