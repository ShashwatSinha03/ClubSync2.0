const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    status: {
        type: String,
        enum: ['PRESENT', 'ABSENT', 'LATE'],
        default: 'PRESENT'
    },
    rsvpStatus: {
        type: String,
        enum: ['GOING', 'MAYBE', 'NOT_GOING'],
        default: 'GOING'
    }
}, {
    timestamps: true
});

// Ensure a user has only one attendance record per event
attendanceSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
