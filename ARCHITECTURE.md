# 🏗️ System Architecture & Implementation Guide

## Overview

**Timetable Pro** is a production-ready full-stack academic management system built with:
- **Frontend:** React 18 + Vite + Tailwind CSS + Redux Toolkit
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Real-time:** Firebase Cloud Messaging (FCM)
- **Scheduling:** Node Cron (IST timezone)

This document explains the architecture, data flows, and key decisions.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  React SPA (Vite)  │  Dark UI  │  Responsive Design    │
└───────────┬─────────────────────────────────────────────┘
            │ REST API (Axios)
            ↓
┌─────────────────────────────────────────────────────────┐
│                    API LAYER (Express.js)               │
│  Auth Routes     │  Timetable Routes  │  Admin Routes   │
│  Section Routes  │  Holiday Routes    │  Notification   │
└───────────┬─────────────────────────────────────────────┘
            │ Mongoose ODM
            ↓
┌─────────────────────────────────────────────────────────┐
│                  DATA LAYER (MongoDB)                   │
│  Users  │  Sections  │  Timetables  │  Holidays  │  ... │
└─────────────────────────────────────────────────────────┘
            │
            ↓
┌─────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                          │
│  Firebase FCM      │  Node Cron (Notifications)         │
│  XLSX Parser       │  JWT Auth                          │
└─────────────────────────────────────────────────────────┘
```

---

## Data Models

### User Schema
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'student' | 'admin',
  section: String,         // e.g., "3A"
  year: String,           // e.g., "3rd Year"
  session: String,        // e.g., "2025-26"
  fcmToken: String,       // For push notifications
  avatar: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Section Schema
```javascript
{
  _id: ObjectId,
  name: String,           // e.g., "3A", "3B"
  session: String,        // e.g., "2025-26"
  year: String,           // e.g., "3rd Year"
  isActive: Boolean,
  createdAt: Date
}
```

### Timetable Schema
```javascript
{
  _id: ObjectId,
  section: String,        // e.g., "3A"
  day: String,           // Monday-Friday
  session: String,       // e.g., "2025-26"
  year: String,          // e.g., "3rd Year"
  subjectName: String,   // e.g., "Java Programming"
  subjectCode: String,   // e.g., "PCS-301"
  facultyName: String,   // Optional
  room: String,          // e.g., "304"
  block: String,         // e.g., "AB1"
  startTime: String,     // e.g., "08:00 AM"
  endTime: String,       // e.g., "09:00 AM"
  type: 'Theory' | 'Lab' | 'Lunch' | 'Free',
  isCancelled: Boolean,
  cancellationReason: String,
  roomChanged: Boolean,
  oldRoom: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Holiday Schema
```javascript
{
  _id: ObjectId,
  date: String,          // YYYY-MM-DD
  reason: String,        // e.g., "Independence Day"
  session: String,       // Optional filter
  isActive: Boolean,
  createdAt: Date
}
```

### Notification Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId,      // Reference to User
  title: String,         // e.g., "Class Starting Soon"
  message: String,
  type: String,          // 'reminder_100', 'reminder_5', 'class_cancelled', etc.
  read: Boolean,
  metadata: Object,      // Additional context (room, subject, etc.)
  sentAt: Date
}
```

---

## Authentication Flow

### Student Registration
```
User fills form (Name, Email, Password, Section)
↓
Session = "2025-26" (auto-filled, locked)
Year = "3rd Year" (auto-filled, locked)
↓
POST /api/auth/register
↓
Backend validates
↓
Password hashed with bcrypt (12 rounds)
↓
User stored in DB
↓
Return JWT token
↓
Frontend stores token in localStorage
```

### Login Flow
```
User enters Email & Password
↓
POST /api/auth/login
↓
Backend finds user, compares password
↓
Returns JWT token + user data
↓
Frontend stores token
↓
All subsequent requests include Authorization header
```

### Protected Routes
```
Every API endpoint (except auth) requires JWT token
↓
Middleware (auth.js) verifies token
↓
If invalid/expired: 401 Unauthorized
↓
If valid: Attach user data to req.user
```

---

## Student Dashboard Flow

```
1. Student logs in → JWT token saved
2. Dashboard loads → useEffect fetchMe() → Redux auth slice
3. Fetch today's timetable:
   - Send section, session, day to backend
   - Backend queries: Timetable.find({ section, day, session, isActive: true, type: { $ne: 'Free' } })
   - Sort by startTime
   - Return with room, faculty, timing details
4. Display classes as cards
5. Detect ongoing class:
   - Current time IST in minutes
   - Compare with class startTime and endTime
   - Apply green border + pulse animation if ongoing
6. Show countdown to next class:
   - Calculate minutes until next startTime
   - Update every second (HH:MM:SS format)
7. Free periods automatically hidden (type: 'Free' filtered out)
```

---

## Admin Timetable Management

### Manual Entry Flow
```
Admin clicks "Add Entry"
↓
Modal opens with fields:
- Session: Auto-filled "2025-26" (locked)
- Year: Auto-filled "3rd Year" (locked)
- Section: Dropdown (fetches from DB)
- Day: Dropdown (Monday-Friday only)
- Time Slot: Grid of 8 predefined slots
- Subject Name, Code, Faculty, Room, Block
- Type: Theory/Lab/Lunch/Free
↓
POST /api/timetable
↓
Backend validates all fields
↓
Auto-create section if not exists
↓
Check for duplicate (section + day + startTime + session)
↓
If exists: Update, else: Create
↓
Trigger notification if update
```

### Excel Upload Flow
```
Admin uploads .xlsx file
↓
Session locked to "2025-26"
↓
POST /api/timetable/upload (multipart/form-data)
↓
Backend:
  1. Parse Excel with XLSX library
  2. Iterate through rows
  3. For each row:
     a. Parse section (handles "3A-3F" → [3A, 3B, ...])
     b. Normalize times (handle Excel date numbers)
     c. For each section:
        - Auto-create section if missing
        - Check for duplicate
        - Upsert (update if exists, create if new)
  4. Return: { created: N, updated: M, errors: [...] }
↓
Send notification to all affected students
```

### Section Range Parsing
```javascript
// Input: "3A-3F"
// Logic:
parseSections("3A-3F") {
  const startChar = "A".charCode = 65
  const endChar = "F".charCode = 70
  for (i = 65; i <= 70; i++) {
    result.push("3" + String.fromCharCode(i))
  }
  // Output: ["3A", "3B", "3C", "3D", "3E", "3F"]
}
```

---

## Notification System

### Architecture
```
┌─────────────────────────────────────┐
│  Cron Job (every minute IST)        │
│  sendClassReminders()               │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│  Get current time in IST            │
│  Find all today's classes           │
│  Check if 100min or 5min away       │
└────────────┬────────────────────────┘
             │
             ↓ (for each matching class)
     ┌───────┴────────┐
     ↓                ↓
  DB Notification  FCM Push
  (saved locally)   (browser)
```

### Notification Types

#### 1. Class Reminder (100 minutes before)
```
Title: "📚 Upcoming Class: Java Programming"
Body: "Starts at 08:00 AM in Room 304"
Metadata: { subject, room, block, startTime }
```

#### 2. Class Reminder (5 minutes before)
```
Title: "⏰ Class Starting Soon: Java Programming"
Body: "Room 304 - Starts in ~5 minutes"
Metadata: { subject, room, block, startTime }
```

#### 3. Class Cancelled
```
Trigger: Admin clicks cancel button
Title: "🚫 Class Cancelled: Java Programming"
Body: "Java Programming on Monday at 08:00 AM has been cancelled"
Metadata: { subject, reason }
```

#### 4. Room Changed
```
Trigger: Admin updates room field
Title: "🏢 Room Changed: Java Programming"
Body: "Moved from AB1-304 to AB2-205"
Metadata: { subject, oldRoom, newRoom }
```

#### 5. Timetable Updated
```
Trigger: Excel upload or bulk changes
Title: "📖 Timetable Updated"
Body: "Your timetable has been updated. Please check."
Metadata: { affectedSections }
```

### FCM Implementation
```javascript
// Backend (notificationScheduler.js)
1. Build message object:
   - notification: { title, body }
   - data: { metadata }
   - webpush config for browser

2. Send to tokens in batches (max 500 tokens/request)
   
3. Handle responses:
   - Success count logged
   - Invalid tokens removed from DB
   
4. Database backup:
   - Save to Notification collection
   - Marked as unread by default

// Frontend (service worker)
firebase-messaging-sw.js handles background messages
- Show notification even if app is closed
- Click → Open app and navigate
```

---

## Performance Optimizations

### Database
1. **Indexes**
   ```javascript
   db.users.createIndex({ email: 1 }, { unique: true })
   db.sections.createIndex({ name: 1, session: 1 })
   db.timetables.createIndex({ section: 1, day: 1, session: 1, startTime: 1 })
   ```

2. **Query Optimization**
   ```javascript
   // Use .lean() to skip Mongoose document creation
   Timetable.find({ section, day, session })
     .select('subjectName facultyName room block startTime endTime')
     .lean()
   ```

3. **Connection Pooling**
   - MongoDB auto-manages up to 100 connections

### Frontend
1. **Redux Caching**
   - 5-minute cache for same-day timetable
   - Avoids unnecessary API calls

2. **Code Splitting**
   - Vite auto-splits at route boundaries
   - Lazy load admin pages

3. **Image Optimization**
   - SVG icons (no PNG overhead)
   - Tailwind purges unused CSS

### Backend
1. **Response Compression**
   - Express handles gzip compression
   - Render auto-compresses

2. **Batch FCM Sending**
   - Send 500 tokens per request (not 1 token per request)
   - Reduces API calls by 99%

---

## Security Implementation

### Authentication
- Passwords hashed with bcrypt (12 rounds)
- JWT tokens expire after 7 days (set in authSlice)
- Tokens stored in localStorage (can use httpOnly cookies for better security)

### Authorization
- Middleware checks user.role (student vs admin)
- Students can only see their section's data
- Admins can manage all sections

### Data Protection
- No sensitive data in response bodies
- Password removed from user.toJSON()
- CORS configured to allow only trusted origins

### API Security
- Input validation on all endpoints
- MongoDB injection prevention via Mongoose
- XSS prevention via React (auto-escapes)

---

## Timezone Handling

### IST (Asia/Kolkata) - UTC+5:30

```javascript
// Backend
const now = moment.tz('Asia/Kolkata')
const dayName = now.format('dddd')      // "Monday"
const time = now.format('HH:mm:ss')     // "09:30:15"

// Frontend (for display)
const istTime = moment.tz(timestamp, 'Asia/Kolkata')

// Cron job
cron.schedule('* * * * *', handler, { timezone: 'Asia/Kolkata' })
```

### Why IST Important
- Class notifications based on IST
- Countdown timers use IST
- Holiday dates in IST
- Admin uploads process in IST

---

## Error Handling

### Backend
```javascript
try {
  // API logic
} catch (error) {
  res.status(500).json({
    success: false,
    message: error.message  // Safe: doesn't leak system info
  })
}
```

### Frontend
```javascript
try {
  const response = await api.post(...)
} catch (err) {
  toast.error(err.response?.data?.message || 'Failed')
}
```

### Logging
- Backend logs to console (Render captures)
- Frontend logs user actions (Redux DevTools)
- FCM errors logged separately

---

## Deployment Architecture

### Production Stack
```
┌─ Frontend (Vercel) ─┐
│  React SPA (Vite)   │
│  Tailwind + Redux   │
│  Auto-deployed      │
└────────┬────────────┘
         │
    HTTPS/REST
         │
┌────────▼────────────────────────┐
│  Backend (Render)               │
│  Node.js + Express.js           │
│  Cron scheduler (every minute)  │
│  Auto-restart on crash          │
└────────┬─────────────────────────┘
         │
  Connection Pool
         │
┌────────▼────────────────────────┐
│  MongoDB Atlas (Cloud)          │
│  Auto-backups daily             │
│  Read replicas for scaling      │
└─────────────────────────────────┘
         │
         ↓
    Firebase FCM
    (external service)
```

---

## Configuration Management

### Environment Variables by Stage

**Development** (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_CONFIG={}  # Optional for dev
```

**Production** (Vercel)
```env
VITE_API_URL=https://api.timetable.render.com/api
VITE_FIREBASE_CONFIG={"apiKey":"..."}
```

**Backend Dev** (backend/.env)
```env
MONGODB_URI=mongodb://localhost:27017/timetable-system
JWT_SECRET=dev-secret-key
```

**Backend Prod** (Render)
```env
MONGODB_URI=mongodb+srv://user:pass@...
JWT_SECRET=<random-secret-generated>
FIREBASE_SERVICE_ACCOUNT_JSON=<full-json>
```

---

## Database Schema Design Decisions

1. **Denormalized sections in timetable**
   - Why: Faster queries, section immutable after class created
   - Trade-off: Update section requires bulk timetable update

2. **String fields for times (not Date)**
   - Why: Simpler for display, no timezone conversion issues
   - Trade-off: Manual string parsing for comparisons

3. **Flat notification structure**
   - Why: Simplicity, easy to query
   - Trade-off: Duplicate data (name in both User and Notification)

4. **Soft delete (isActive flag)**
   - Why: Preserve historical data
   - Trade-off: Must always filter for isActive

---

## Future Enhancements

1. **Caching Layer** — Redis for timetable caching
2. **Real-time Updates** — WebSocket for live timetable sync
3. **Analytics** — Track most-visited classes, peak times
4. **Mobile App** — React Native version
5. **Offline Support** — Service Worker caching
6. **ML Recommendations** — Predict busy times
7. **Email Notifications** — SMTP integration
8. **SMS Alerts** — Twilio integration
9. **Custom Alarms** — Per-class notifications
10. **Timetable History** — Version control for timetables

---

## Monitoring & Maintenance

### Health Checks
- Frontend: Lighthouse audit weekly
- Backend: API health check every minute
- Database: Backup verification daily

### Logging
- Backend errors → Render console logs
- FCM delivery → notification scheduler logs
- Frontend errors → Sentry (optional)

### Alerting
- Database down → Email alert
- API errors spike → Slack notification
- FCM failures → Log inspection

---

## Testing Strategy (Recommended)

1. **Unit Tests** — Redux slices, utility functions
2. **Integration Tests** — API endpoints
3. **E2E Tests** — Cypress for user flows
4. **Load Testing** — k6 for FCM batch sends
5. **Security Testing** — OWASP checklist

---

This architecture is designed for:
✅ **Scalability** — Easy to add caching, CDN, read replicas
✅ **Maintainability** — Clear separation of concerns
✅ **Reliability** — FCM fallback, database backups
✅ **Performance** — Optimized queries, caching layers
✅ **Security** — JWT auth, data validation, CORS

