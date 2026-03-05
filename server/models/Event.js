const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Rehearsal', 'Jam', 'Audition', 'Performance', 'Jam Session', 'Workshop', 'Concert', 'Meeting']
  },
  dateTime: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  attendance: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['PENDING', 'PRESENT', 'ABSENT'], default: 'PENDING' }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', EventSchema);
