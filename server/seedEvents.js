const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Event = require('./models/Event');

dotenv.config();

const seedEvents = async () => {
  await connectDB();

  try {
    await Event.deleteMany();

    const events = [
      {
        title: "Friday Jam Session",
        type: "Jam",
        dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        location: "Studio 1, Rishihood University",
        notes: "Bring your own instruments. We will be covering classic rock hits."
      },
      {
        title: "Vocal Workshop",
        type: "Rehearsal",
        dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        location: "Music Room 2",
        notes: "Focus on harmony and breath control."
      },
      {
        title: "Acoustic Night",
        type: "Performance",
        dateTime: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
        location: "Main Auditorium",
        notes: "Soft acoustics only."
      },
      {
        title: "Last Week's Rehearsal",
        type: "Rehearsal",
        dateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        location: "Studio 1",
        notes: "Successful rehearsal for the upcoming show."
      }
    ];

    await Event.insertMany(events);
    console.log('Events seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding events:', error);
    process.exit(1);
  }
};

seedEvents();
