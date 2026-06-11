# 🚀 Quick Reference Guide

## Start Development

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with MongoDB URI and Firebase credentials
npm run dev
# Server: http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App: http://localhost:5173
```

---

## Key APIs

### Auth
```
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

### Timetable
```
GET /api/timetable               # Today's classes (student)
GET /api/timetable/week          # Weekly timetable (student)
GET /api/timetable/all           # All entries (admin)
POST /api/timetable              # Add entry (admin)
PUT /api/timetable/:id           # Edit entry (admin)
DELETE /api/timetable/:id        # Delete entry (admin)
POST /api/timetable/:id/cancel   # Cancel class (admin)
POST /api/timetable/upload       # Upload Excel (admin)
```

### Sections
```
GET /api/sections                # Get sections
POST /api/sections               # Create section (admin)
PUT /api/sections/:id            # Edit section (admin)
DELETE /api/sections/:id         # Delete section (admin)
```

### Notifications
```
GET /api/notifications           # User's notifications
POST /api/notifications          # Create (backend)
PUT /api/notifications/:id/read  # Mark as read
```

---

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@...
JWT_SECRET=your-secret-key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_PROJECT_ID=your-project-id
```

---

## Database Collections

### Users
```javascript
{
  name, email, password (hashed),
  role: 'student' | 'admin',
  section: "3A",
  year: "3rd Year",
  session: "2025-26",
  fcmToken,
  isActive
}
```

### Sections
```javascript
{
  name: "3A",
  session: "2025-26",
  year: "3rd Year",
  isActive
}
```

### Timetables
```javascript
{
  section: "3A",
  day: "Monday",
  session: "2025-26",
  year: "3rd Year",
  subjectName, subjectCode,
  facultyName, room, block,
  startTime: "08:00 AM",
  endTime: "09:00 AM",
  type: 'Theory' | 'Lab' | 'Lunch' | 'Free',
  isCancelled, cancellationReason,
  isActive
}
```

---

## Redux Slices

### authSlice
- `loginUser(email, password)`
- `registerUser(userData)`
- `fetchMe()`
- `logout()`

### timetableSlice
- `fetchTimetable(date)`
- `fetchWeeklyTimetable()`
- `fetchAllTimetable(filters)`

### notificationSlice
- `fetchNotifications()`
- `markAsRead(notificationId)`

---

## File Structure (Important)

```
backend/
├── config/firebase.js          # Firebase init
├── models/                     # Database schemas
├── routes/                     # API endpoints
├── middleware/auth.js          # JWT middleware
├── utils/notificationScheduler.js  # FCM & cron
└── server.js                   # Entry point

frontend/
├── src/
│   ├── pages/                  # Page components
│   ├── components/             # Reusable components
│   ├── store/                  # Redux slices
│   ├── services/api.js         # Axios instance
│   └── utils/                  # Helper functions
└── public/firebase-messaging-sw.js  # Service worker
```

---

## Common Commands

### Development
```bash
# Backend
npm run dev           # Start dev server
npm start             # Start production

# Frontend
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build
```

### Database
```bash
# Connect to MongoDB
mongosh mongodb+srv://user:pass@cluster...

# Create indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.sections.createIndex({ name: 1, session: 1 })
db.timetables.createIndex({ section: 1, day: 1, session: 1, startTime: 1 })
```

### Deployment
```bash
# Frontend to Vercel
vercel deploy

# Backend to Render (via GitHub)
# Push to main branch, Render auto-deploys
```

---

## Testing with Postman

### Register Student
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@college.edu",
  "password": "test1234",
  "section": "3A",
  "year": "3rd Year",
  "session": "2025-26"
}
```

### Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@college.edu",
  "password": "test1234"
}
```

### Get Today's Timetable
```
GET http://localhost:5000/api/timetable
Authorization: Bearer <JWT_TOKEN>
```

### Add Section (Admin)
```
POST http://localhost:5000/api/sections
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "name": "3A",
  "session": "2025-26",
  "year": "3rd Year"
}
```

### Add Timetable (Admin)
```
POST http://localhost:5000/api/timetable
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "section": "3A",
  "day": "Monday",
  "session": "2025-26",
  "year": "3rd Year",
  "subjectName": "Java Programming",
  "subjectCode": "PCS-301",
  "facultyName": "Prof. Rajesh",
  "room": "304",
  "block": "AB1",
  "startTime": "08:00 AM",
  "endTime": "09:00 AM",
  "type": "Theory"
}
```

---

## Debugging

### Backend
```javascript
// Check Firebase
console.log('Firebase ready:', isFirebaseReady())

// Check MongoDB
db.users.find({}).limit(1)  // In MongoDB shell

// Check cron logs
// See server console for: "✅ FCM sent to X devices"
```

### Frontend
```javascript
// Redux DevTools
// Open browser DevTools > Redux tab

// Network tab
// See /api/ requests

// Service Worker
// Open DevTools > Application > Service Workers

// Notifications
// Allow permission, check browser notification tray
```

### Logs
```bash
# Render backend logs
# Dashboard > Services > Logs

# Vercel frontend logs
# Settings > Deployments > View logs

# Firebase Console
# Cloud Messaging > Logs
```

---

## Timezone

All times use **IST (Asia/Kolkata, UTC+5:30)**

```javascript
// Backend
moment.tz('Asia/Kolkata')

// Frontend (display)
moment.tz(timestamp, 'Asia/Kolkata')

// Cron
cron.schedule('* * * * *', handler, { timezone: 'Asia/Kolkata' })
```

---

## Common Issues

### "Firebase not initialized"
- Check `FIREBASE_SERVICE_ACCOUNT_JSON` in .env
- Ensure Firebase project created
- Check credentials are valid

### "Notification permission denied"
- Browser settings > Notifications
- Whitelist domain
- Clear cache

### "Connection refused" (MongoDB)
- Check MongoDB running
- Verify `MONGODB_URI` correct
- Check network/firewall

### "Duplicate key error"
- Section already exists
- Check unique indexes
- Restart server

---

## Performance Tips

1. **Database**
   - Always use indexes
   - Use `.lean()` for read-only
   - Avoid N+1 queries

2. **Frontend**
   - Lazy load pages
   - Cache timetable (5 min)
   - Minimize re-renders

3. **Backend**
   - Batch FCM sends
   - Connection pooling
   - Response compression

---

## Security Checklist

- [ ] Change `JWT_SECRET` in production
- [ ] Use strong MongoDB password
- [ ] Whitelist CORS origins
- [ ] Enable HTTPS (auto on Vercel/Render)
- [ ] Secure Firebase credentials
- [ ] Validate all inputs
- [ ] Use environment variables

---

## Useful Links

- [Firebase FCM Docs](https://firebase.google.com/docs/cloud-messaging)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)

---

## Support

- Setup issues → See SETUP_GUIDE.md
- Deployment → See DEPLOYMENT_CHECKLIST.md
- Architecture → See ARCHITECTURE.md
- Implementation → See IMPLEMENTATION_SUMMARY.md

---

**Quick Reference v2.0** | Production Ready ✅
