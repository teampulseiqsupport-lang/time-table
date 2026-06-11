# 🎓 TimeTable Pro — Academic Timetable Management System

A production-ready full-stack system for colleges/universities to manage and display timetables. Students log in once, select their section, and see live class schedules with ongoing class detection, countdown timers, and push notifications.

---

## ✨ Features

### Student
- 🔐 JWT Authentication with section selection
- 📅 Today's timetable with live class detection
- 🟢 **Ongoing Class** — green border + pulse animation
- ⏰ **Upcoming Class** — countdown timer (HH:MM:SS)
- 🕐 Day Arc — animated IST clock showing day progress
- 📆 Calendar view — browse any date's schedule
- 📅 Weekly view — full week at a glance
- 🎉 Holiday detection — no-class banner
- 🆓 Free periods hidden automatically
- 🔔 Push notifications (browser + background via FCM)
- 📱 Fully responsive dark UI

### Admin
- 📊 Dashboard stats (students, sections, subjects, entries)
- 📤 **Excel Upload** — bulk import with section auto-detection
  - Supports `3A,3B,3C` and `3A-3F` range notation
  - Auto-creates sections
  - Duplicate prevention (update instead of insert)
- ✏️ Manual timetable builder
- 🏫 Section management
- 🎉 Holiday management
- 👥 Student list with search
- ❌ Class cancellation with reason
- 🔔 Auto-notification on timetable update

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Tailwind CSS, Redux Toolkit |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT |
| Notifications | Firebase Cloud Messaging (FCM) |
| Scheduling | Node Cron (class reminders) |
| Excel | xlsx library |
| Deployment | Vercel (frontend) + Render (backend) + MongoDB Atlas |

---

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your MongoDB URI and JWT secret
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev
```

### Create Admin Account

After backend starts, call:
```
POST http://localhost:5000/api/admin/setup
```
This creates `admin@college.edu` / `Admin@123`

---

## 📁 Project Structure

```
timetable-system/
├── backend/
│   ├── models/          # User, Section, Timetable, Holiday, Notification
│   ├── routes/          # auth, timetable, section, admin, holiday, notification
│   ├── middleware/       # JWT auth
│   ├── utils/           # notificationScheduler (cron)
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── pages/       # Student & Admin pages
│   │   ├── components/  # ClassCard, CountdownTimer, DayArc, Layout
│   │   ├── store/       # Redux slices
│   │   ├── services/    # Axios API client
│   │   └── utils/       # IST time utilities
│   └── public/          # firebase-messaging-sw.js
└── EXCEL_TEMPLATE_GUIDE.md
```

---

## 📊 Excel Upload Format

| Column | Required | Notes |
|--------|----------|-------|
| Section | ✅ | Single: `3A` \| List: `3A,3B,3C` \| Range: `3A-3F` |
| Day | ✅ | Monday–Saturday |
| Subject | ✅ | Subject name |
| Code | | Subject code e.g. PCS-301 |
| Faculty | | Faculty name |
| Room | | Room number |
| Block | | Block e.g. AB1 |
| StartTime | ✅ | `08:00 AM` |
| EndTime | ✅ | `09:00 AM` |
| Type | | Theory / Lab / Lunch / Free |
| Session | | e.g. 2024-25 |
| Year | | e.g. 3rd Year |

---

## 🔔 Notification Schedule

| Trigger | Type |
|---------|------|
| 100 minutes before class | Upcoming class reminder |
| 5 minutes before class | Class starting soon |
| Room changed | Room update alert |
| Class cancelled | Cancellation notice |
| Timetable updated | General update |

---

## 🌐 Deployment

### Vercel (Frontend)
1. Push `frontend/` to GitHub
2. Import in Vercel
3. Set `VITE_API_URL` to your Render backend URL

### Render (Backend)
1. Push `backend/` to GitHub
2. Create Web Service on Render
3. Set all environment variables from `.env.example`

### MongoDB Atlas
1. Create a free cluster
2. Get connection string
3. Set as `MONGODB_URI` in Render

---

## 🕐 IST Timezone

All class detection and countdown logic uses `Asia/Kolkata (IST, UTC+5:30)`.

---

## 📄 License

MIT
