const mongoose = require('mongoose');

const RSVPSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['GOING', 'NOT_GOING']
  }
}, {
  timestamps: true
});

// Ensure a user can only have one RSVP per event
RSVPSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('RSVP', RSVPSchema);
