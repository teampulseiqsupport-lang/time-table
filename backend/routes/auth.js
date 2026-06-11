const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
};

// @POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, section, year, session } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, section, year, session, role: 'student' });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token: generateToken(user._id),
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id),
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/auth/fcm-token
router.put('/fcm-token', protect, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    await User.findByIdAndUpdate(req.user._id, { fcmToken });
    res.json({ success: true, message: 'FCM token updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/auth/save-fcm-token (alias for frontend convenience)
router.post('/save-fcm-token', protect, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ success: false, message: 'FCM token required' });
    }
    
    await User.findByIdAndUpdate(req.user._id, { fcmToken });
    console.log(`✅ FCM token saved for user ${req.user._id}`);
    res.json({ success: true, message: 'FCM token saved successfully' });
  } catch (error) {
    console.error('FCM token save error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, section, year, session } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, section, year, session },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
