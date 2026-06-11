const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const moment = require('moment-timezone');
const Timetable = require('../models/Timetable');
const Section = require('../models/Section');
const Holiday = require('../models/Holiday');
const { protect, adminOnly } = require('../middleware/auth');
const { sendTimetableUpdateNotification } = require('../utils/notificationScheduler');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Parse section ranges like "3A,3B,3C" or "3A-3F"
const parseSections = (sectionStr) => {
  if (!sectionStr) return [];
  sectionStr = sectionStr.toString().trim();
  
  const sections = [];
  
  if (sectionStr.includes('-') && !sectionStr.includes(',')) {
    const parts = sectionStr.split('-');
    if (parts.length === 2) {
      const prefix = parts[0].replace(/[A-Z]$/i, '');
      const startChar = parts[0].replace(prefix, '').toUpperCase();
      const endChar = parts[1].replace(prefix, '').toUpperCase();
      const startCode = startChar.charCodeAt(0);
      const endCode = endChar.charCodeAt(0);
      for (let i = startCode; i <= endCode; i++) {
        sections.push(prefix + String.fromCharCode(i));
      }
      return sections;
    }
  }
  
  return sectionStr.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
};

// Convert time format
const normalizeTime = (timeVal) => {
  if (!timeVal) return '';
  if (typeof timeVal === 'number') {
    const totalMinutes = Math.round(timeVal * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    return `${String(h).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
  }
  return timeVal.toString().trim();
};

// @GET /api/timetable - Get timetable for logged-in student
router.get('/', protect, async (req, res) => {
  try {
    const { date, week } = req.query;
    const user = req.user;

    if (!user.section || !user.session) {
      return res.status(400).json({ success: false, message: 'Please update your profile with section and session' });
    }

    const targetDate = date ? moment.tz(date, 'Asia/Kolkata') : moment.tz('Asia/Kolkata');
    const dayName = targetDate.format('dddd');

    // Check holiday
    const holiday = await Holiday.findOne({ date: targetDate.format('YYYY-MM-DD'), isActive: true });
    if (holiday) {
      return res.json({ success: true, holiday: holiday.reason, timetable: [], date: targetDate.format('YYYY-MM-DD'), day: dayName });
    }

    // Get timetable (optimized with field selection and lean)
    const timetable = await Timetable.find({
      section: user.section.toUpperCase(),
      session: user.session,
      day: dayName,
      isActive: true,
      type: { $ne: 'Free' }
    })
    .select('subjectName subjectCode facultyName room block startTime endTime type isCancelled cancellationReason roomChanged oldRoom')
    .sort({ startTime: 1 })
    .lean();

    res.json({
      success: true,
      timetable,
      date: targetDate.format('YYYY-MM-DD'),
      day: dayName,
      section: user.section,
      session: user.session
    });
  } catch (error) {
    console.error('Timetable fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/timetable/week - Get weekly timetable
router.get('/week', protect, async (req, res) => {
  try {
    const user = req.user;
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const timetable = await Timetable.find({
      section: user.section.toUpperCase(),
      session: user.session,
      day: { $in: days },
      isActive: true,
      type: { $ne: 'Free' }
    })
    .select('day subjectName subjectCode facultyName room block startTime endTime type isCancelled')
    .sort({ day: 1, startTime: 1 })
    .lean();

    const grouped = {};
    days.forEach(d => { grouped[d] = []; });
    timetable.forEach(entry => {
      if (grouped[entry.day]) grouped[entry.day].push(entry);
    });

    res.json({ success: true, timetable: grouped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/timetable/all - Admin: get all timetable entries
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const { section, session, year, day } = req.query;
    const query = {};
    if (section) query.section = section;
    if (session) query.session = session;
    if (year) query.year = year;
    if (day) query.day = day;

    const timetable = await Timetable.find(query)
    .select('section session day year subjectName subjectCode facultyName room block startTime endTime type isActive')
    .sort({ section: 1, day: 1, startTime: 1 })
    .lean();
    res.json({ success: true, timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/timetable/upload - Admin: upload Excel
router.post('/upload', protect, adminOnly, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: false });
    const results = { created: 0, updated: 0, errors: [], sections: new Set() };

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      for (const row of rows) {
        try {
          const sectionStr = row['Section'] || row['section'] || '';
          const sectionsArr = parseSections(sectionStr);

          if (!sectionsArr.length) continue;

          const day = row['Day'] || row['day'] || '';
          const subjectName = row['Subject'] || row['SubjectName'] || row['subject_name'] || '';
          const subjectCode = row['Code'] || row['SubjectCode'] || row['subject_code'] || '';
          const facultyName = row['Faculty'] || row['FacultyName'] || row['faculty'] || '';
          const room = row['Room'] || row['room'] || '';
          const block = row['Block'] || row['block'] || '';
          const startTime = normalizeTime(row['StartTime'] || row['start_time'] || row['Start Time'] || '');
          const endTime = normalizeTime(row['EndTime'] || row['end_time'] || row['End Time'] || '');
          const type = row['Type'] || row['type'] || 'Theory';
          const session = row['Session'] || row['session'] || req.body.session || '2024-25';
          const year = row['Year'] || row['year'] || '';

          if (!day || !subjectName || !startTime || !endTime) continue;

          for (const section of sectionsArr) {
            results.sections.add(section);

            // Auto-create section if not exists
            await Section.findOneAndUpdate(
              { name: section, session },
              { name: section, session, year, isActive: true },
              { upsert: true, new: true }
            );

            // Upsert timetable entry
            const filter = { section, day, startTime, session };
            const update = { section, day, subjectName, subjectCode, facultyName, room, block, startTime, endTime, type, session, year, isActive: true };

            const existing = await Timetable.findOne(filter);
            if (existing) {
              await Timetable.findOneAndUpdate(filter, update);
              results.updated++;
            } else {
              await Timetable.create(update);
              results.created++;
            }
          }
        } catch (rowErr) {
          results.errors.push(rowErr.message);
        }
      }
    }

    // Notify all students about timetable update
    sendTimetableUpdateNotification();

    res.json({
      success: true,
      message: `Processed: ${results.created} created, ${results.updated} updated`,
      sections: [...results.sections],
      created: results.created,
      updated: results.updated,
      errors: results.errors
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/timetable - Admin: manual entry
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { section, day, startTime, session } = req.body;
    
    // Auto-create section
    if (section && session) {
      await Section.findOneAndUpdate(
        { name: section.toUpperCase(), session },
        { name: section.toUpperCase(), session, isActive: true },
        { upsert: true, new: true }
      );
    }

    const existing = await Timetable.findOne({ section: section?.toUpperCase(), day, startTime, session });
    if (existing) {
      const updated = await Timetable.findByIdAndUpdate(existing._id, req.body, { new: true });
      return res.json({ success: true, timetable: updated, message: 'Updated existing entry' });
    }

    const timetable = await Timetable.create({ ...req.body, section: section?.toUpperCase() });
    res.status(201).json({ success: true, timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/timetable/:id - Admin: edit entry
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const original = await Timetable.findById(req.params.id);
    if (!original) return res.status(404).json({ success: false, message: 'Not found' });

    const updated = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // Handle room change notification
    if (req.body.room && req.body.room !== original.room) {
      updated.roomChanged = true;
      updated.oldRoom = original.room;
      await updated.save();
    }

    res.json({ success: true, timetable: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @DELETE /api/timetable/:id - Admin: delete entry
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Timetable.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/timetable/:id/cancel - Admin: cancel class
router.post('/:id/cancel', protect, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    const entry = await Timetable.findByIdAndUpdate(
      req.params.id,
      { isCancelled: true, cancellationReason: reason || 'Cancelled by admin' },
      { new: true }
    );
    res.json({ success: true, timetable: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
