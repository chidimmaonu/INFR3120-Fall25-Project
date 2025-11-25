const mongoose = require('mongoose');


// Define Event Schema
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields automatically
});


// Create and export the model
module.exports = mongoose.model('Event', eventSchema);
