const moment = require('moment-timezone');
const User = require('../models/User');
const Timetable = require('../models/Timetable');
const Notification = require('../models/Notification');
const { isFirebaseReady, getFirebaseAdmin } = require('../config/firebase');

let firebaseAdmin = null;


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
        await notifySection(cls, 'reminder_100', `📚 Upcoming Class: ${cls.subjectName}`, `Starts at ${cls.startTime} in ${cls.room || 'check timetable'}`);
      }

      // 5-minute reminder
      const key5 = `${cls._id}-5-${todayStr}`;
      if (diffMins >= 4 && diffMins <= 6 && !sentReminders.get(key5)) {
        sentReminders.set(key5, true);
        await notifySection(cls, 'reminder_5', `⏰ Class Starting Soon: ${cls.subjectName}`, `Room ${cls.room || 'TBD'} - Starts in ~5 minutes`);
      }
    }

    // Clean old keys (older than today)
    if (sentReminders.size > 1000) sentReminders.clear();

  } catch (error) {
    console.error('❌ Notification scheduler error:', error);
  }
};

const notifySection = async (cls, type, title, message) => {
  try {
    const students = await User.find({ section: cls.section, session: cls.session, role: 'student', isActive: true });
    
    const notifications = students.map(student => ({
      userId: student._id,
      title,
      message,
      type,
      sentAt: new Date(),
      metadata: { 
        timetableId: cls._id, 
        room: cls.room, 
        block: cls.block,
        startTime: cls.startTime,
        endTime: cls.endTime,
        subject: cls.subjectName,
        faculty: cls.facultyName
      }
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`✅ Saved ${notifications.length} DB notifications for: ${cls.subjectName}`);
    }

    // FCM push (if firebase-admin configured)
    const tokens = students.filter(s => s.fcmToken).map(s => s.fcmToken);
    if (tokens.length > 0) {
      await sendFCMNotification(tokens, title, message, {
        timetableId: cls._id.toString(),
        room: cls.room,
        block: cls.block,
        subject: cls.subjectName,
        faculty: cls.facultyName,
        startTime: cls.startTime,
        type: type
      });
    }
  } catch (error) {
    console.error('❌ notifySection error:', error);
  }
};

const sendTimetableUpdateNotification = async (session, year, section) => {
  try {
    const students = await User.find({ 
      role: 'student', 
      isActive: true,
      session,
      year,
      ...(section && { section })
    });

    if (students.length === 0) return;

    const notifications = students.map(s => ({
      userId: s._id,
      title: '📖 Timetable Updated',
      message: 'Your timetable has been updated. Please check your schedule.',
      type: 'timetable_updated',
      sentAt: new Date(),
      metadata: { affectedSections: section || 'multiple' }
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`✅ Saved ${notifications.length} timetable update notifications`);
    }

    // Send FCM to affected students
    const tokens = students.filter(s => s.fcmToken).map(s => s.fcmToken);
    if (tokens.length > 0) {
      await sendFCMNotification(tokens, '📖 Timetable Updated', 'Your timetable has been updated. Please check your schedule.', {
        type: 'timetable_updated',
        affectedSections: section || 'multiple'
      });
    }
  } catch (error) {
    console.error('❌ sendTimetableUpdateNotification error:', error);
  }
};

const sendClassCancelledNotification = async (timetable, reason) => {
  try {
    const students = await User.find({ 
      section: timetable.section, 
      session: timetable.session, 
      role: 'student', 
      isActive: true 
    });

    if (students.length === 0) return;

    const notifications = students.map(s => ({
      userId: s._id,
      title: `🚫 Class Cancelled: ${timetable.subjectName}`,
      message: `${timetable.subjectName} on ${timetable.day} at ${timetable.startTime} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
      type: 'class_cancelled',
      sentAt: new Date(),
      metadata: { 
        timetableId: timetable._id,
        subject: timetable.subjectName,
        reason: reason
      }
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`✅ Saved ${notifications.length} class cancellation notifications`);
    }

    // Send FCM
    const tokens = students.filter(s => s.fcmToken).map(s => s.fcmToken);
    if (tokens.length > 0) {
      const message = `${timetable.subjectName} on ${timetable.day} at ${timetable.startTime} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`;
      await sendFCMNotification(tokens, `🚫 Class Cancelled: ${timetable.subjectName}`, message, {
        type: 'class_cancelled',
        timetableId: timetable._id.toString(),
        subject: timetable.subjectName,
        reason: reason
      });
    }
  } catch (error) {
    console.error('❌ sendClassCancelledNotification error:', error);
  }
};

const sendRoomChangedNotification = async (timetable, oldRoom, newRoom) => {
  try {
    const students = await User.find({ 
      section: timetable.section, 
      session: timetable.session, 
      role: 'student', 
      isActive: true 
    });

    if (students.length === 0) return;

    const notifications = students.map(s => ({
      userId: s._id,
      title: `🏢 Room Changed: ${timetable.subjectName}`,
      message: `${timetable.subjectName} on ${timetable.day} at ${timetable.startTime} has moved from ${oldRoom} to ${newRoom}.`,
      type: 'room_changed',
      sentAt: new Date(),
      metadata: { 
        timetableId: timetable._id,
        subject: timetable.subjectName,
        oldRoom: oldRoom,
        newRoom: newRoom
      }
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      console.log(`✅ Saved ${notifications.length} room change notifications`);
    }

    // Send FCM
    const tokens = students.filter(s => s.fcmToken).map(s => s.fcmToken);
    if (tokens.length > 0) {
      const message = `${timetable.subjectName} on ${timetable.day} at ${timetable.startTime} has moved from ${oldRoom} to ${newRoom}.`;
      await sendFCMNotification(tokens, `🏢 Room Changed: ${timetable.subjectName}`, message, {
        type: 'room_changed',
        timetableId: timetable._id.toString(),
        subject: timetable.subjectName,
        oldRoom: oldRoom,
        newRoom: newRoom
      });
    }
  } catch (error) {
    console.error('❌ sendRoomChangedNotification error:', error);
  }
};

const sendFCMNotification = async (tokens, title, body, data = {}) => {
  try {
    if (!isFirebaseReady()) {
      console.warn('⚠️  Firebase not configured. Skipping FCM for:', title);
      return;
    }

    firebaseAdmin = getFirebaseAdmin();
    if (!firebaseAdmin) {
      console.warn('⚠️  Firebase not available. Skipping FCM for:', title);
      return;
    }

    const message = {
      notification: {
        title: title.substring(0, 65),
        body: body.substring(0, 240)
      },
      data: {
        ...data,
        timestamp: new Date().toISOString()
      },
      webpush: {
        fcmOptions: {
          link: '/'
        },
        notification: {
          title: title.substring(0, 65),
          body: body.substring(0, 240),
          icon: '/timetable-icon.png',
          badge: '/badge-icon.png',
          tag: data.type || 'notification'
        },
        data: {
          ...data,
          timestamp: new Date().toISOString()
        }
      }
    };

    // Send to tokens in batches
    const batchSize = 500;
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);
      try {
        const response = await firebaseAdmin.messaging().sendMulticast({
          ...message,
          tokens: batch
        });
        
        console.log(`✅ FCM sent to ${response.successCount} devices. Failed: ${response.failureCount}`);
        
        // Remove invalid tokens
        if (response.failureCount > 0) {
          const invalidTokens = [];
          response.responses.forEach((res, idx) => {
            if (!res.success) {
              invalidTokens.push(batch[idx]);
            }
          });
          
          if (invalidTokens.length > 0) {
            await User.updateMany(
              { fcmToken: { $in: invalidTokens } },
              { $set: { fcmToken: null } }
            );
            console.log(`🧹 Removed ${invalidTokens.length} invalid FCM tokens`);
          }
        }
      } catch (err) {
        console.error('❌ FCM batch send error:', err);
      }
    }
  } catch (error) {
    console.error('❌ FCM error:', error);
  }
};

module.exports = { 
  sendClassReminders, 
  sendTimetableUpdateNotification,
  sendClassCancelledNotification,
  sendRoomChangedNotification,
  timeToMinutes,
  sendFCMNotification
};
