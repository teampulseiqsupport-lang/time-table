const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  date: {
    type: String,
    required: [true, 'Date is required'],
    unique: true
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Holiday', holidaySchema);
