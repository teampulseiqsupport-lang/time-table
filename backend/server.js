require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');

const authRoutes = require('./routes/auth');
const timetableRoutes = require('./routes/timetable');
const sectionRoutes = require('./routes/section');
const adminRoutes = require('./routes/admin');
const holidayRoutes = require('./routes/holiday');
const notificationRoutes = require('./routes/notification');

const { sendClassReminders } = require('./utils/notificationScheduler');

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    
    // अगर origin नहीं है (जैसे mobile app requests) तो allow करो
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/timetable-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Timetable API Running', timestamp: new Date().toISOString() });
});

// Cron: Run every minute to check for class reminders
cron.schedule('* * * * *', async () => {
  await sendClassReminders();
}, {
  timezone: 'Asia/Kolkata'
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
