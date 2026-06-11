const mongoose = require('mongoose');

const ReferenceFileSchema = new mongoose.Schema(
  {
    fileName: String,
    fileSize: Number,
    mimeType: String,
    uploadedBy: String,  // Admin name
    uploadDate: {
      type: Date,
      default: Date.now
    },
    session: String,
    year: String,
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active'
    },
    description: String,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReferenceFile', ReferenceFileSchema);
