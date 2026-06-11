# 📋 Production Deployment Checklist

## Pre-Deployment Phase

### Code Quality
- [ ] All console.error/console.log reviewed
- [ ] No hardcoded passwords/secrets
- [ ] Error handling implemented
- [ ] Input validation on all forms
- [ ] SQL/NoSQL injection prevention
- [ ] XSS protection enabled

### Testing
- [ ] Manual testing completed on all pages
- [ ] Login flow tested (student & admin)
- [ ] Timetable display verified
- [ ] Notifications tested
- [ ] Excel upload tested with sample file
- [ ] Mobile responsiveness checked
- [ ] Dark mode rendering verified

### Environment Configuration
- [ ] `.env` file created with production values
- [ ] No `.env` file committed to Git
- [ ] All required env vars documented
- [ ] Secrets rotated (if reusing)
- [ ] Timezone set to Asia/Kolkata

---

## Backend Deployment (Render)

### Pre-Deployment
- [ ] Push code to GitHub main branch
- [ ] All tests passing locally
- [ ] Build runs without errors: `npm install && npm start`
- [ ] Database connection tested
- [ ] Firebase credentials ready

### Render Configuration
- [ ] Create Web Service from GitHub repo
- [ ] Set Build Command: `npm install`
- [ ] Set Start Command: `npm start`
- [ ] Environment Variables Set:
  - [ ] `MONGODB_URI` (Atlas connection string)
  - [ ] `JWT_SECRET` (generate random: `openssl rand -base64 32`)
  - [ ] `FRONTEND_URL` (Vercel domain)
  - [ ] `NODE_ENV=production`
  - [ ] `FIREBASE_PROJECT_ID`
  - [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` (paste full JSON)

### Post-Deployment
- [ ] Backend URL accessible from browser
- [ ] `/api/health` returns status OK
- [ ] No 502/503 errors in logs
- [ ] CORS allowing Vercel domain
- [ ] Cron job running (check logs for notification scheduler)

---

## Frontend Deployment (Vercel)

### Pre-Deployment
- [ ] Build succeeds locally: `npm run build`
- [ ] No build warnings
- [ ] All dependencies in package.json
- [ ] Public files (icons, service worker) included

### Vercel Configuration
- [ ] Import project from GitHub
- [ ] Framework: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Environment Variables:
  - [ ] `VITE_API_URL` (Render backend URL)
  - [ ] `VITE_FIREBASE_*` (Firebase config)

### Post-Deployment
- [ ] App loads without errors
- [ ] API calls reaching backend (check Network tab)
- [ ] Notifications permission prompting
- [ ] Forms submitting successfully
- [ ] Mobile view responsive

---

## Database (MongoDB Atlas)

### Pre-Deployment
- [ ] Cluster created and running
- [ ] Network whitelist includes Render IP
- [ ] Database user created
- [ ] Connection string copied and tested
- [ ] Backups configured

### Post-Deployment
- [ ] Collections created (auto or manual)
- [ ] Indexes created for performance:
  ```javascript
  db.users.createIndex({ email: 1 }, { unique: true })
  db.sections.createIndex({ name: 1, session: 1 })
  db.timetables.createIndex({ section: 1, day: 1, session: 1, startTime: 1 })
  ```
- [ ] Data migration complete (if migrating from old DB)
- [ ] Backup scheduled daily

---

## Firebase Cloud Messaging

### Pre-Deployment
- [ ] Firebase project created
- [ ] Web app registered
- [ ] Service account key generated
- [ ] Web push certificate generated
- [ ] Public key configured in frontend

### Post-Deployment
- [ ] Students can receive notifications
- [ ] Notifications show in browser even when closed
- [ ] Service worker handling background messages
- [ ] No FCM errors in console

---

## Security Audit

### Authentication
- [ ] JWT tokens have expiration
- [ ] Passwords hashed with bcrypt
- [ ] Admin-only routes protected
- [ ] Session validation on each request

### Data Protection
- [ ] HTTPS enabled (auto on Vercel/Render)
- [ ] Database credentials not in client
- [ ] API endpoints validate user ownership
- [ ] CORS configured (not * in production)

### API Security
- [ ] Rate limiting considered
- [ ] Input sanitization implemented
- [ ] No sensitive data in logs
- [ ] Error messages don't leak system info

### Access Control
- [ ] Student can't access admin endpoints
- [ ] Students only see their section's timetable
- [ ] Admins can only manage their institution
- [ ] File uploads validated

---

## Performance Verification

### Backend
- [ ] Response time < 500ms
- [ ] Database queries using indexes
- [ ] No N+1 query problems
- [ ] Memory usage stable

### Frontend
- [ ] Page load < 3 seconds
- [ ] Lighthouse score > 80
- [ ] No layout shift issues
- [ ] Animations smooth (60fps)

### Database
- [ ] Connection pooling configured
- [ ] No slow queries in logs
- [ ] Indexes created for all common queries
- [ ] Backups running without impact

---

## Monitoring & Logging

### Setup
- [ ] Render error logs accessible
- [ ] Firebase Cloud Logging enabled
- [ ] MongoDB Atlas alerts configured
- [ ] Email alerts for critical errors

### Checks
- [ ] No 500 errors in logs
- [ ] Notification scheduler running (check cron logs)
- [ ] Database connection stable
- [ ] API response times normal

---

## Documentation

- [ ] README.md updated with production URLs
- [ ] SETUP_GUIDE.md complete and tested
- [ ] API documentation available
- [ ] Emergency contacts documented
- [ ] Rollback procedure documented

---

## Final Verification

### Smoke Tests
1. **User Flow**
   - [ ] Student registration successful
   - [ ] Student can login
   - [ ] Can view today's timetable
   - [ ] Countdown timer working
   - [ ] Push notification received

2. **Admin Flow**
   - [ ] Admin login successful
   - [ ] Can create section
   - [ ] Can add timetable entry
   - [ ] Can upload Excel
   - [ ] Can cancel class (notification sends)

3. **System Health**
   - [ ] All pages load
   - [ ] No console errors
   - [ ] Responsive on mobile
   - [ ] Notifications working

---

## Go-Live Checklist

- [ ] All pre-deployment items checked
- [ ] Team aware of launch
- [ ] Support channel ready
- [ ] Rollback plan ready
- [ ] Monitoring dashboards active
- [ ] Database backups verified
- [ ] Incident response plan shared

---

## Post-Launch

### Week 1
- [ ] Monitor error logs daily
- [ ] Respond to user feedback
- [ ] Check notification delivery
- [ ] Verify performance metrics

### Week 2-4
- [ ] Gather usage analytics
- [ ] Fix any reported bugs
- [ ] Optimize based on performance data
- [ ] Add documentation based on user questions

### Ongoing
- [ ] Weekly security audits
- [ ] Monthly backups verification
- [ ] Quarterly performance review
- [ ] Annual security penetration test

---

**Deployment Status: [ ] Ready to Deploy**

**Deployed By:** _______________
**Date:** _______________
**Version:** _______________

