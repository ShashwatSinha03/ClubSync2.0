const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['rehearsal', 'jam', 'audition', 'performance'],
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    notes: {
        type: String // Setlist, instructions etc.
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rsvpList: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['GOING', 'MAYBE', 'NOT_GOING'],
            default: 'GOING'
        }
    }],
    attendance: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['PRESENT', 'ABSENT', 'LATE'],
            default: 'PRESENT'
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
