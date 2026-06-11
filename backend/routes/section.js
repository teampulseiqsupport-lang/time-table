const express = require('express');
const router = express.Router();
const Section = require('../models/Section');
const { protect, adminOnly } = require('../middleware/auth');

// @GET /api/sections - Public (for registration dropdown)
router.get('/', async (req, res) => {
  try {
    const { session } = req.query;
    const query = { isActive: true };
    if (session) query.session = session;
    
    const sections = await Section.find(query).sort({ name: 1 });
    res.json({ success: true, sections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/sections - Admin only
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, session, year } = req.body;
    
    const existing = await Section.findOne({ name: name.toUpperCase(), session });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Section already exists' });
    }
    
    const section = await Section.create({ name, session, year });
    res.status(201).json({ success: true, section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/sections/:id - Admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const section = await Section.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
    res.json({ success: true, section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @DELETE /api/sections/:id - Admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Section.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Section deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
