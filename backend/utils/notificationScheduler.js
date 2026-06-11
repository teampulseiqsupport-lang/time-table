const moment = require('moment-timezone');
const User = require('../models/User');
const Timetable = require('../models/Timetable');
const Notification = require('../models/Notification');

// Convert "08:00 AM" to minutes from midnight
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const clean = timeStr.toString().trim().toUpperCase();
  const match = clean.match(/(\d+):(\d+)\s*(AM|PM)/);
  if (!match) return 0;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const ampm = match[3];
  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

let sentReminders = new Map(); // key: `${timetableId}-${type}-${date}`, value: true

const sendClassReminders = async () => {
  try {
    const now = moment.tz('Asia/Kolkata');
    const dayName = now.format('dddd');
    const todayStr = now.format('YYYY-MM-DD');
    const currentMinutes = now.hours() * 60 + now.minutes();

    // Get all today's classes
    const classes = await Timetable.find({ day: dayName, isActive: true, type: { $ne: 'Free' } });

    for (const cls of classes) {
      const startMins = timeToMinutes(cls.startTime);
      const diffMins = startMins - currentMinutes;

      // 100-minute reminder
      const key100 = `${cls._id}-100-${todayStr}`;
      if (diffMins >= 99 && diffMins <= 101 && !sentReminders.get(key100)) {
        sentReminders.set(key100, true);
        await notifySection(cls, 'reminder_100', `Upcoming Class: ${cls.subjectName}`, `Starts at ${cls.startTime} in ${cls.room || 'check timetable'}`);
      }

      // 5-minute reminder
      const key5 = `${cls._id}-5-${todayStr}`;
      if (diffMins >= 4 && diffMins <= 6 && !sentReminders.get(key5)) {
        sentReminders.set(key5, true);
        await notifySection(cls, 'reminder_5', `Class Starting Soon: ${cls.subjectName}`, `Room ${cls.room || 'TBD'} - Starts in ~5 minutes`);
      }
    }

    // Clean old keys (older than today)
    if (sentReminders.size > 1000) sentReminders.clear();

  } catch (error) {
    console.error('Notification scheduler error:', error);
  }
};

const notifySection = async (cls, type, title, message) => {
  try {
    const students = await User.find({ section: cls.section, session: cls.session, role: 'student' });
    
    const notifications = students.map(student => ({
      userId: student._id,
      title,
      message,
      type,
      sentAt: new Date(),
      metadata: { timetableId: cls._id, room: cls.room, startTime: cls.startTime }
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // FCM push (if firebase-admin configured)
    const tokens = students.filter(s => s.fcmToken).map(s => s.fcmToken);
    if (tokens.length > 0) {
      await sendFCMNotification(tokens, title, message);
    }
  } catch (error) {
    console.error('notifySection error:', error);
  }
};

const sendTimetableUpdateNotification = async () => {
  try {
    const students = await User.find({ role: 'student', isActive: true });
    const notifications = students.map(s => ({
      userId: s._id,
      title: 'Timetable Updated',
      message: 'Your timetable has been updated. Please check your schedule.',
      type: 'timetable_updated',
      sentAt: new Date()
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('sendTimetableUpdateNotification error:', error);
  }
};

const sendFCMNotification = async (tokens, title, body) => {
  try {
    if (!process.env.FIREBASE_PROJECT_ID) return;
    
    // FCM implementation placeholder
    // In production, use firebase-admin to send messages
    console.log(`[FCM] Sending to ${tokens.length} devices: ${title}`);
  } catch (error) {
    console.error('FCM error:', error);
  }
};

module.exports = { sendClassReminders, sendTimetableUpdateNotification, timeToMinutes };
