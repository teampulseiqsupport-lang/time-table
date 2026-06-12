const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timetableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Timetable',
    required: true
  },
  reminderMinutes: {
    type: Number,
    required: true
  },
  classDate: {
    type: String,
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

notificationLogSchema.index(
  { studentId: 1, timetableId: 1, classDate: 1, reminderMinutes: 1 },
  { unique: true }
);
notificationLogSchema.index({ timetableId: 1, classDate: 1 });

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
