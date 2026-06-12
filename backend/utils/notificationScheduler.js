const moment = require('moment-timezone');
const admin = require('firebase-admin');
const User = require('../models/User');
const Timetable = require('../models/Timetable');
const Notification = require('../models/Notification');
const NotificationLog = require('../models/NotificationLog');
const { isFirebaseReady, getFirebaseAdmin } = require('../config/firebase');

const DEFAULT_ROUTE = '/student/dashboard';
let firebaseAdmin = null;

const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const clean = timeStr.toString().trim().toUpperCase();
  const match = clean.match(/(\d+):(\d+)\s*(AM|PM)/);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3];

  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

const createReminderLog = async (studentId, timetableId, classDate, reminderMinutes) => {
  try {
    await NotificationLog.create({ studentId, timetableId, classDate, reminderMinutes });
    return true;
  } catch (error) {
    if (error.code === 11000) return false;
    throw error;
  }
};

const sendClassReminders = async () => {
  try {
    const now = moment.tz('Asia/Kolkata');
    const todayStr = now.format('YYYY-MM-DD');
    const dayName = now.format('dddd');
    const currentMinutes = now.hours() * 60 + now.minutes();

    const classes = await Timetable.find({
      day: dayName,
      isActive: true,
      isCancelled: { $ne: true },
      type: { $nin: ['Free', 'Lunch'] },
      $or: [{ date: null }, { date: '' }, { date: todayStr }]
    });

    for (const cls of classes) {
      const reminderMinutes = Number.isFinite(cls.reminderBeforeMinutes)
        ? cls.reminderBeforeMinutes
        : 10;
      const diffMins = timeToMinutes(cls.startTime) - currentMinutes;

      if (diffMins !== reminderMinutes) continue;

      await notifySection(
        cls,
        'class_reminder',
        '📚 Class Starting Soon',
        `Your ${cls.subjectName} class starts in ${reminderMinutes} minutes.`,
        todayStr,
        reminderMinutes
      );
    }
  } catch (error) {
    console.error('Notification scheduler error:', error);
  }
};

const notifySection = async (cls, type, title, message, classDate = null, reminderMinutes = null) => {
  try {
    const students = await User.find({
      section: cls.section,
      session: cls.session,
      role: 'student',
      isActive: true
    });

    const recipients = [];

    for (const student of students) {
      if (type !== 'class_reminder') {
        recipients.push(student);
        continue;
      }

      const logCreated = await createReminderLog(student._id, cls._id, classDate, reminderMinutes);
      if (logCreated) recipients.push(student);
    }

    if (recipients.length === 0) return;

    const notifications = recipients.map(student => ({
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
        faculty: cls.facultyName,
        reminderMinutes,
        route: DEFAULT_ROUTE
      }
    }));

    await Notification.insertMany(notifications);

    const tokens = recipients.filter(student => student.fcmToken).map(student => student.fcmToken);
    if (tokens.length > 0) {
      await sendFCMNotification(tokens, title, message, {
        timetableId: cls._id.toString(),
        room: cls.room || '',
        block: cls.block || '',
        subject: cls.subjectName || '',
        faculty: cls.facultyName || '',
        startTime: cls.startTime || '',
        reminderMinutes: String(reminderMinutes ?? ''),
        type,
        route: DEFAULT_ROUTE
      });
    }
  } catch (error) {
    console.error('notifySection error:', error);
  }
};

const sendTimetableUpdateNotification = async (session, year, section) => {
  try {
    const students = await User.find({
      role: 'student',
      isActive: true,
      ...(session && { session }),
      ...(year && { year }),
      ...(section && { section })
    });

    if (students.length === 0) return;

    const notifications = students.map(student => ({
      userId: student._id,
      title: 'Timetable Updated',
      message: 'Your timetable has been updated. Please check your schedule.',
      type: 'timetable_updated',
      sentAt: new Date(),
      metadata: { affectedSections: section || 'multiple', route: DEFAULT_ROUTE }
    }));

    await Notification.insertMany(notifications);

    const tokens = students.filter(student => student.fcmToken).map(student => student.fcmToken);
    if (tokens.length > 0) {
      await sendFCMNotification(tokens, 'Timetable Updated', 'Your timetable has been updated. Please check your schedule.', {
        type: 'timetable_updated',
        affectedSections: section || 'multiple',
        route: DEFAULT_ROUTE
      });
    }
  } catch (error) {
    console.error('sendTimetableUpdateNotification error:', error);
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

    const message = `${timetable.subjectName} on ${timetable.day} at ${timetable.startTime} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`;
    const notifications = students.map(student => ({
      userId: student._id,
      title: `Class Cancelled: ${timetable.subjectName}`,
      message,
      type: 'class_cancelled',
      sentAt: new Date(),
      metadata: {
        timetableId: timetable._id,
        subject: timetable.subjectName,
        reason,
        route: DEFAULT_ROUTE
      }
    }));

    await Notification.insertMany(notifications);

    const tokens = students.filter(student => student.fcmToken).map(student => student.fcmToken);
    if (tokens.length > 0) {
      await sendFCMNotification(tokens, `Class Cancelled: ${timetable.subjectName}`, message, {
        type: 'class_cancelled',
        timetableId: timetable._id.toString(),
        subject: timetable.subjectName || '',
        reason: reason || '',
        route: DEFAULT_ROUTE
      });
    }
  } catch (error) {
    console.error('sendClassCancelledNotification error:', error);
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

    const message = `${timetable.subjectName} on ${timetable.day} at ${timetable.startTime} has moved from ${oldRoom} to ${newRoom}.`;
    const notifications = students.map(student => ({
      userId: student._id,
      title: `Room Changed: ${timetable.subjectName}`,
      message,
      type: 'room_changed',
      sentAt: new Date(),
      metadata: {
        timetableId: timetable._id,
        subject: timetable.subjectName,
        oldRoom,
        newRoom,
        route: DEFAULT_ROUTE
      }
    }));

    await Notification.insertMany(notifications);

    const tokens = students.filter(student => student.fcmToken).map(student => student.fcmToken);
    if (tokens.length > 0) {
      await sendFCMNotification(tokens, `Room Changed: ${timetable.subjectName}`, message, {
        type: 'room_changed',
        timetableId: timetable._id.toString(),
        subject: timetable.subjectName || '',
        oldRoom: oldRoom || '',
        newRoom: newRoom || '',
        route: DEFAULT_ROUTE
      });
    }
  } catch (error) {
    console.error('sendRoomChangedNotification error:', error);
  }
};

const sendFCMNotification = async (tokens, title, body, data = {}) => {
  try {
    if (!isFirebaseReady()) {
      console.warn('Firebase not configured. Skipping FCM for:', title);
      return;
    }

    firebaseAdmin = getFirebaseAdmin();
    if (!firebaseAdmin) {
      console.warn('Firebase not available. Skipping FCM for:', title);
      return;
    }

    const payloadData = Object.fromEntries(
      Object.entries({
        ...data,
        route: data.route || DEFAULT_ROUTE,
        timestamp: new Date().toISOString()
      }).map(([key, value]) => [key, String(value ?? '')])
    );

    const message = {
      notification: {
        title: title.substring(0, 65),
        body: body.substring(0, 240)
      },
      data: payloadData,
      webpush: {
        fcmOptions: {
          link: payloadData.route === DEFAULT_ROUTE ? '/dashboard' : payloadData.route
        },
        notification: {
          title: title.substring(0, 65),
          body: body.substring(0, 240),
          icon: '/icon.svg',
          badge: '/badge.svg',
          tag: payloadData.type || 'notification',
          requireInteraction: true
        },
        data: payloadData
      }
    };

    const batchSize = 500;
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);

      try {
        // Get the messaging service from the Firebase app
        const messaging = admin.messaging(firebaseAdmin);
        
        // Send individual messages instead of using sendMulticast due to Firebase Admin v14+ compatibility
        const promises = batch.map(token =>
          messaging.send({
            ...message,
            token
          }).catch(err => {
            console.error(`FCM send failed for token: ${err.message}`);
            return { success: false, token, error: err };
          })
        );

        const results = await Promise.allSettled(promises);

        const successCount = results.filter(r => r.status === 'fulfilled' && r.value?.success !== false).length;
        const failureCount = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value?.success === false)).length;

        console.log(`FCM sent to ${successCount} devices. Failed: ${failureCount}`);

        // Collect invalid tokens from failed sends
        const invalidTokens = [];
        results.forEach((result, idx) => {
          if (result.status === 'rejected') {
            invalidTokens.push(batch[idx]);
          } else if (result.status === 'fulfilled' && result.value?.success === false) {
            invalidTokens.push(result.value.token);
          }
        });

        if (invalidTokens.length > 0) {
          await User.updateMany(
            { fcmToken: { $in: invalidTokens } },
            { $set: { fcmToken: null } }
          );
        }
      } catch (error) {
        console.error('FCM batch send error:', error);
      }
    }
  } catch (error) {
    console.error('FCM error:', error);
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
