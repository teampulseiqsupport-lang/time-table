# 🚀 Complete Setup & Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Firebase Cloud Messaging (FCM) Setup](#firebase-cloud-messaging-setup)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Production Deployment](#production-deployment)
7. [Testing the System](#testing-the-system)

---

## Prerequisites

### Required Tools
- Node.js v16+ and npm
- MongoDB Account (Atlas free tier)
- Firebase Project
- Git

### Recommended Tools
- VS Code or your IDE
- Postman (for API testing)
- MongoDB Compass (visual DB explorer)

---

## Local Development Setup

### 1. Clone and Setup Backend

```bash
cd backend
npm install
```

### 2. Clone and Setup Frontend

```bash
cd frontend
npm install
```

### 3. Create Environment Files

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/timetable-system
JWT_SECRET=your_jwt_secret_key_here_change_in_production
FRONTEND_URL=http://localhost:5173

# Firebase (Optional - can be added later)
FIREBASE_PROJECT_ID=your-firebase-project-id
```

#### Frontend (.env.local)
Create `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_CONFIG={"apiKey":"...","projectId":"..."}
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

---

## Firebase Cloud Messaging Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `timetable-system`
4. Enable Google Analytics (optional)
5. Create project

### Step 2: Setup Web App

1. In Firebase Console, click Web icon (</> )
2. Register app name: `timetable-web`
3. Copy the config object (you'll need this for frontend)
4. Click "Continue to console"

### Step 3: Generate Service Account Key

1. Go to Project Settings (⚙️ icon)
2. Click "Service Accounts" tab
3. Click "Generate new private key"
4. A JSON file downloads automatically
5. Keep this file secure! ⚠️

### Step 4: Setup Web Push Certificates

1. In Firebase Console, go to "Cloud Messaging" tab
2. Scroll to "Web Push certificates"
3. Click "Generate key pair"
4. Save the Public Key (use in frontend)

### Step 5: Configure Backend Environment

Copy the service account JSON content:

```bash
# Replace with your actual service account JSON
export FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"timetable-system-xxxxx","..."}'
export FIREBASE_PROJECT_ID=timetable-system-xxxxx
```

**Or** save the JSON file and use:
```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
```

### Step 6: Configure Frontend

In `frontend/.env.local`, add Firebase config:

```env
VITE_FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxx
VITE_FIREBASE_PROJECT_ID=timetable-system-xxxxx
VITE_FIREBASE_APP_ID=1:123456789:web:abcdefg123456
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_PUBLIC_KEY=BExxxxxxxxxxxxxx
```

### Step 7: Register Service Worker

Frontend already has `firebase-messaging-sw.js`. Ensure it's in `public/` folder:

```javascript
// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  projectId: "YOUR_PROJECT_ID",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message:', payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: '/timetable-icon.png'
  });
});
```

---

## Environment Configuration

### Backend Environment Variables

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| `PORT` | Optional | 5000 | Server port |
| `NODE_ENV` | Optional | development | Environment |
| `MONGODB_URI` | ✅ | mongodb+srv://... | Database URL |
| `JWT_SECRET` | ✅ | your-secret-key | Auth token signing |
| `FRONTEND_URL` | ✅ | http://localhost:5173 | CORS origin |
| `FIREBASE_PROJECT_ID` | Optional | your-project-id | FCM setup |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Optional | {...} | Service account |
| `GOOGLE_APPLICATION_CREDENTIALS` | Optional | /path/to/key.json | Credential file |

### Frontend Environment Variables

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| `VITE_API_URL` | ✅ | http://localhost:5000/api | Backend URL |
| `VITE_FIREBASE_API_KEY` | Optional | AIzaSy... | Firebase auth |
| `VITE_FIREBASE_PROJECT_ID` | Optional | timetable-system | Firebase project |
| `VITE_FIREBASE_PUBLIC_KEY` | Optional | BE... | FCM public key |

---

## Database Setup

### Option 1: MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create new cluster (free tier available)
4. Whitelist your IP:
   - Security > Network Access
   - Add IP Address (or 0.0.0.0/0 for dev)
5. Create database user
6. Get connection string
7. Use in `MONGODB_URI`

### Option 2: Local MongoDB

```bash
# Install MongoDB
# macOS: brew install mongodb-community
# Windows: Download from mongodb.com

# Start MongoDB
mongod

# Connection string
MONGODB_URI=mongodb://localhost:27017/timetable-system
```

### Initialize Collections

Collections auto-create on first write. To pre-create:

```bash
# In MongoDB shell or Compass
use timetable-system

db.users.createIndex({ email: 1 }, { unique: true })
db.sections.createIndex({ name: 1, session: 1 }, { unique: true })
db.timetables.createIndex({ section: 1, day: 1, startTime: 1, session: 1 })
```

---

## Production Deployment

### Frontend: Deploy to Vercel

1. Push frontend to GitHub:
```bash
cd frontend
git init
git add .
git commit -m "Initial commit"
git push origin main
```

2. Go to [Vercel](https://vercel.com)
3. Import project from GitHub
4. Set environment variables:
   - `VITE_API_URL` = Your Render backend URL

### Backend: Deploy to Render

1. Push backend to GitHub:
```bash
cd backend
git init
git add .
git commit -m "Initial commit"
git push origin main
```

2. Go to [Render](https://render.com)
3. Create "Web Service"
4. Connect GitHub repo
5. Set build command: `npm install`
6. Set start command: `npm start`
7. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_SERVICE_ACCOUNT_JSON`
   - `FRONTEND_URL` (Vercel URL)

### Database: Use MongoDB Atlas

Already covered above.

### Update CORS

In `backend/server.js`, update `FRONTEND_URL`:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-vercel-domain.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean)
```

---

## Testing the System

### 1. Test Authentication

```bash
# Register student
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "student@college.edu",
    "password": "test1234",
    "session": "2025-26",
    "year": "3rd Year",
    "section": "3A"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@college.edu",
    "password": "test1234"
  }'
```

### 2. Test Admin Features

```bash
# Create section
curl -X POST http://localhost:5000/api/sections \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "3A",
    "session": "2025-26",
    "year": "3rd Year"
  }'

# Add timetable
curl -X POST http://localhost:5000/api/timetable \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### 3. Test FCM Notifications

1. Login to student dashboard
2. Browser should request notification permission
3. Save FCM token to user profile
4. Admin cancels a class → Student gets notification
5. Check browser notification tray

### 4. Test Excel Upload

1. Create Excel file with columns:
   - Section (required)
   - Day (required)
   - Subject (required)
   - Code
   - Faculty
   - Room
   - Block
   - StartTime (required)
   - EndTime (required)
   - Type

2. Upload via Admin > Upload

3. System should:
   - Parse sections (3A-3F)
   - Auto-create sections
   - Create timetable entries
   - Send notifications

---

## Troubleshooting

### Firebase Issues

**"Firebase not initialized"**
- Check `FIREBASE_SERVICE_ACCOUNT_JSON` or `GOOGLE_APPLICATION_CREDENTIALS`
- Ensure service account has correct permissions
- Restart backend server

**"Notification permission denied"**
- Browser settings > Notifications
- Whitelist domain: localhost or your app URL
- Clear browser cache

### Database Issues

**"Connection refused"**
- Check MongoDB running
- Verify `MONGODB_URI` is correct
- Check network connectivity

**"Duplicate key error"**
- Likely trying to create duplicate section
- Check unique indexes

### Deployment Issues

**"Build fails on Render"**
- Check `npm install` completes
- Verify all environment variables set
- Check for missing dependencies

**"Vercel can't connect to backend"**
- Verify `VITE_API_URL` correct
- Check CORS settings on backend
- Test with Postman first

---

## Performance Tuning

1. **Database Indexing** — Queries optimized with indexes
2. **Frontend Caching** — 5-minute cache for timetable
3. **FCM Batching** — Notifications sent in 500-token batches
4. **Gzip Compression** — Enable on Render/Vercel

---

## Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use strong MongoDB password
- [ ] Whitelist CORS origins
- [ ] Enable HTTPS (auto on Vercel/Render)
- [ ] Keep service account key private
- [ ] Use environment variables (never commit secrets)
- [ ] Enable 2FA on Firebase/MongoDB/GitHub

---

## Support & Documentation

- [Firebase FCM Docs](https://firebase.google.com/docs/cloud-messaging)
- [MongoDB Atlas Docs](https://docs.mongodb.com/atlas/)
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)

---

**Happy Deploying! 🚀**
