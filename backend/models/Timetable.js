const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  session: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: String,
    required: true,
    trim: true
  },
  section: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  subjectName: {
    type: String,
    required: true,
    trim: true
  },
  subjectCode: {
    type: String,
    trim: true,
    default: ''
  },
  facultyName: {
    type: String,
    trim: true,
    default: ''
  },
  room: {
    type: String,
    trim: true,
    default: ''
  },
  block: {
    type: String,
    trim: true,
    default: ''
  },
  startTime: {
    type: String,
    required: true
  },
  reminderBeforeMinutes: {
    type: Number,
    min: 0,
    max: 1440,
    default: 10
  },
  date: {
    type: String,
    trim: true,
    default: null
  },
  batch: {
    type: String,
    trim: true,
    default: ''
  },
  endTime: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Theory', 'Lab', 'Lunch', 'Free'],
    default: 'Theory'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isCancelled: {
    type: Boolean,
    default: false
  },
  cancellationReason: {
    type: String,
    default: ''
  },
  roomChanged: {
    type: Boolean,
    default: false
  },
  oldRoom: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Compound index for duplicate prevention
timetableSchema.index({ section: 1, day: 1, startTime: 1, session: 1 }, { unique: true });

// Performance optimization indexes
timetableSchema.index({ section: 1, session: 1, day: 1, isActive: 1, type: 1 });
timetableSchema.index({ section: 1, session: 1, isActive: 1, type: 1 });
timetableSchema.index({ isActive: 1, type: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);
