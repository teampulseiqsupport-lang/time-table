import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMe, setInitialized } from './store/slices/authSlice'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardLayout from './components/shared/DashboardLayout'
import StudentDashboard from './pages/StudentDashboard'
import WeeklyView from './pages/WeeklyView'
import CalendarView from './pages/CalendarView'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import PageNotFound from './pages/PageNotFound';

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminTimetable from './pages/admin/AdminTimetable'
import AdminSections from './pages/admin/AdminSections'
import AdminHolidays from './pages/admin/AdminHolidays'
import AdminStudents from './pages/admin/AdminStudents'
import AdminUpload from './pages/admin/AdminUpload'
import AdminList from './pages/admin/AdminList'
import AddAdmin from './pages/admin/AddAdmin'

import LoadingScreen from './components/shared/LoadingScreen'

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, token, initialized } = useSelector(s => s.auth)
  if (!initialized) return <LoadingScreen />
  if (!token || !user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

const PublicRoute = ({ children }) => {
  const { user, token, initialized } = useSelector(s => s.auth)
  if (!initialized) return <LoadingScreen />
  if (token && user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  }
  return children
}

export default function App() {
  const dispatch = useDispatch()
  const { token, initialized } = useSelector(s => s.auth)

  // ✅ fake loader state
  const [booting, setBooting] = useState(true)

  // auth initialization
  useEffect(() => {
    if (token && !initialized) {
      dispatch(fetchMe())
    } else if (!token && !initialized) {
      dispatch(setInitialized())
    }
  }, [token, initialized, dispatch])

  // 🎯 fake random loader (1.8s - 2.2s)
  useEffect(() => {
    const delay = Math.floor(Math.random() * (2200 - 1800 + 1)) + 1800

    const timer = setTimeout(() => {
      setBooting(false)
    }, delay)

    return () => clearTimeout(timer)
  }, [])

  // loader condition
  if (!initialized || booting) return <LoadingScreen />

  return (
    <Routes>
      <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />

      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Student Routes */}
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="weekly" element={<WeeklyView />} />
        <Route path="calendar" element={<CalendarView />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Admin Routes */}
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
  )
}