const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { getFirebaseAdmin, isFirebaseReady } = require('../config/firebase');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '30d' });
};

const normalizeRollNumber = (rollNumber) => rollNumber?.toString().trim().toUpperCase();

const buildResetEmailHtml = ({ name, resetUrl }) => `
  <div style="margin:0;padding:0;background:#f4f7fb;font-family:Inter,Arial,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 12px;background:#f4f7fb;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="background:#111827;padding:26px 28px;color:#ffffff;">
                <div style="font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:#93c5fd;">CampusFlow</div>
                <h1 style="margin:8px 0 0;font-size:26px;line-height:1.2;">Reset your password</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 28px;">
                <p style="margin:0 0 14px;font-size:16px;">Hi ${name || 'Student'},</p>
                <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#4b5563;">We received a request to reset your Timetable Pro password. Use the secure button below. This link expires in 15 minutes.</p>
                <a href="${resetUrl}" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:13px 20px;border-radius:10px;font-weight:700;font-size:14px;">Reset Password</a>
                <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">If the button does not work, copy this link:<br><span style="word-break:break-all;color:#374151;">${resetUrl}</span></p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;text-align:center;">
                Powered by CampusFlow<br>
                Developed by Arpan Jain
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
`;

const sendResetEmail = async ({ to, name, resetUrl }) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured. Password reset email skipped.');
    return false;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || 'Timetable Pro <hello@urbantales-ecommerce.in>',
      to,
      subject: 'Reset your Timetable Pro password',
      html: buildResetEmailHtml({ name, resetUrl })
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend email failed: ${detail}`);
  }

  return true;
};

// @POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, section, year, session, universityRollNumber } = req.body;
    const rollNumber = normalizeRollNumber(universityRollNumber);

    if (!name || !email || !password || !rollNumber) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { universityRollNumber: rollNumber }
      ]
    });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email or roll number already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      universityRollNumber: rollNumber,
      section,
      year,
      session,
      role: 'student',
      authProvider: 'local'
    });

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
    const { email, identifier, password } = req.body;
    const loginId = (identifier || email || '').toString().trim();

    if (!loginId || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email/roll number and password' });
    }

    const user = await User.findOne({
      $or: [
        { email: loginId.toLowerCase() },
        { universityRollNumber: normalizeRollNumber(loginId) }
      ]
    }).select('+password');
    if (!user || !user.password || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email/roll number or password' });
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

// @POST /api/auth/google - Login with Firebase Google auth (NO AUTO SIGNUP)
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Google ID token required' });
    }

    if (!isFirebaseReady()) {
      return res.status(503).json({ success: false, message: 'Google authentication is not configured on the server' });
    }

    const firebaseAdmin = getFirebaseAdmin();
    const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);

    if (!decoded.email) {
      return res.status(400).json({ success: false, message: 'Google account email not available' });
    }

    const user = await User.findOne({ email: decoded.email.toLowerCase() });

    if (!user) {
      // User doesn't exist - they must register first
      return res.status(404).json({ success: false, message: 'User account not found. Please register first.' });
    }

    // Update avatar if available
    if (decoded.picture && !user.avatar) {
      user.avatar = decoded.picture;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Google login successful',
      token: generateToken(user._id),
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { emailOrRoll } = req.body;
    const identifier = emailOrRoll?.toString().trim();

    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Email or roll number required' });
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { universityRollNumber: normalizeRollNumber(identifier) }
      ]
    }).select('+passwordResetToken +passwordResetExpires');

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save({ validateBeforeSave: false });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetUrl = `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${rawToken}`;
      await sendResetEmail({ to: user.email, name: user.name, resetUrl });
    }

    res.json({
      success: true,
      message: 'If an account exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Unable to send reset email right now' });
  }
});

// @POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Valid token and 6 character password required' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }
    }).select('+passwordResetToken +passwordResetExpires +password');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Reset link is invalid or expired' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    if (user.authProvider === 'google') user.authProvider = 'local';
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful',
      token: generateToken(user._id),
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Reset password error:', error);
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

    if (!fcmToken || typeof fcmToken !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid FCM token required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { fcmToken: fcmToken.trim() } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'FCM token updated', fcmTokenSaved: Boolean(user.fcmToken) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/auth/save-fcm-token (alias for frontend convenience)
router.post('/save-fcm-token', protect, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken || typeof fcmToken !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid FCM token required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { fcmToken: fcmToken.trim() } },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log(`FCM token saved for user ${req.user._id}`);
    res.json({ success: true, message: 'FCM token saved successfully', fcmTokenSaved: Boolean(user.fcmToken) });
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
