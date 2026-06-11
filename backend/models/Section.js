const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Section name is required'],
    trim: true,
    uppercase: true
  },
  session: {
    type: String,
    required: [true, 'Session is required'],
    trim: true
  },
  year: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

sectionSchema.index({ name: 1, session: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema);
