const express = require('express');
const router = express.Router();
const Holiday = require('../models/Holiday');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const holidays = await Holiday.find({ isActive: true }).sort({ date: 1 });
    res.json({ success: true, holidays });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const holiday = await Holiday.create(req.body);
    res.status(201).json({ success: true, holiday });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Holiday.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Holiday removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
