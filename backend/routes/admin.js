const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Section = require('../models/Section');
const Timetable = require('../models/Timetable');
const { protect, adminOnly } = require('../middleware/auth');

// @GET /api/admin/stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [totalStudents, totalSections, totalSubjects, totalEntries] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      Section.countDocuments({ isActive: true }),
      Timetable.distinct('subjectCode', { isActive: true }).then(r => r.length),
      Timetable.countDocuments({ isActive: true })
    ]);

    res.json({
      success: true,
      stats: { totalStudents, totalSections, totalSubjects, totalEntries }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/admin/students
router.get('/students', protect, adminOnly, async (req, res) => {
  try {
    const students = await User.find({ role: 'student', isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin login (create default admin if not exists)
router.post('/setup', async (req, res) => {
  try {
    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      return res.json({ success: false, message: 'Admin already exists' });
    }
    const admin = await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@college.edu',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin'
    });
    res.json({ success: true, message: 'Admin created', email: admin.email });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
