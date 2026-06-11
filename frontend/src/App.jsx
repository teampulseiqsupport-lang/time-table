import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMe, setInitialized } from './store/slices/authSlice'
import { initializeFirebaseMessaging, requestNotificationPermission } from './services/firebaseNotification'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardLayout from './components/shared/DashboardLayout'
import StudentDashboard from './pages/StudentDashboard'
import WeeklyView from './pages/WeeklyView'
import CalendarView from './pages/CalendarView'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import PageNotFound from './pages/PageNotFound'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminTimetable from './pages/admin/AdminTimetable'
import AdminSections from './pages/admin/AdminSections'
import AdminHolidays from './pages/admin/AdminHolidays'
import AdminStudents from './pages/admin/AdminStudents'
import AdminUpload from './pages/admin/AdminUpload'
import AdminList from './pages/admin/AdminList'
import AddAdmin from './pages/admin/AddAdmin'

import LoadingScreen from './components/shared/LoadingScreen'
import TopProgressBar from './components/shared/TopProgressBar'

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, token, initialized } = useSelector(s => s.auth)

  if (!initialized) return <LoadingScreen text="Checking session..." />
  if (!token || !user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />

  return children
}

const PublicRoute = ({ children }) => {
  const { user, token, initialized } = useSelector(s => s.auth)

  if (!initialized) return <LoadingScreen text="Loading..." />
  if (token && user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  }

  return children
}

// 👉 page names
const routeNames = {
  '/dashboard': 'Dashboard',
  '/weekly': 'Weekly Schedule',
  '/calendar': 'Calendar',
  '/notifications': 'Notifications',
  '/profile': 'Profile',

  '/admin': 'Admin Dashboard',
  '/admin/timetable': 'Timetable',
  '/admin/upload': 'Upload Excel',
  '/admin/sections': 'Sections',
  '/admin/holidays': 'Holidays',
  '/admin/students': 'Students',
  '/admin/admins': 'Admins',
  '/admin/add-admin': 'Add Admin',
}

export default function App() {
  const dispatch = useDispatch()
  const { token, initialized } = useSelector(s => s.auth)
  const location = useLocation()

  const [splash, setSplash] = useState(true)
  const [pageLoading, setPageLoading] = useState(false)
  const [firstRenderDone, setFirstRenderDone] = useState(false)

  // auth init
  useEffect(() => {
    if (token && !initialized) {
      dispatch(fetchMe())
    } else if (!token && !initialized) {
      dispatch(setInitialized())
    }
  }, [token, initialized, dispatch])

  // Firebase messaging init and permission request
  useEffect(() => {
    const setupNotifications = async () => {
      if (token && initialized) {
        // Initialize Firebase messaging
        await initializeFirebaseMessaging()

        // Request permission automatically
        const hasPermission = await requestNotificationPermission()
        if (hasPermission) {
          console.log('✅ Push notifications enabled')
        } else {
          console.log('⚠️  Push notifications disabled')
        }
      }
    }

    setupNotifications()
  }, [token, initialized])

  // splash only first time
  useEffect(() => {
    const timer = setTimeout(() => {
      setSplash(false)
      setFirstRenderDone(true)
    }, 1800)

    return () => clearTimeout(timer)
  }, [])

  // route loader
  useEffect(() => {
    if (!firstRenderDone) return

    setPageLoading(true)

    const timer = setTimeout(() => {
      setPageLoading(false)
    }, 400)

    return () => clearTimeout(timer)
  }, [location.pathname, firstRenderDone])

  // SPLASH SCREEN
  if (splash) {
    return <LoadingScreen text="Loading Timetable System..." />
  }

  const pageName = routeNames[location.pathname] || "Page"

  return (
    <>
      {/* 🔥 Top Progress Bar */}
      <TopProgressBar loading={pageLoading} />

      {/* 🔥 Overlay loader (NOT full screen block) */}
      {pageLoading && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <LoadingScreen text={`Loading ${pageName}...`} />
        </div>
      )}

      <Routes>
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />

        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Student */}
        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="weekly" element={<WeeklyView />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><DashboardLayout isAdmin /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="timetable" element={<AdminTimetable />} />
          <Route path="upload" element={<AdminUpload />} />
          <Route path="sections" element={<AdminSections />} />
          <Route path="holidays" element={<AdminHolidays />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="admins" element={<AdminList />} />
          <Route path="add-admin" element={<AddAdmin />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  )
}