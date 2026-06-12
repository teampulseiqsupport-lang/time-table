import React, { useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  LayoutDashboard, Calendar, CalendarDays, Bell, User, LogOut,
  Menu, Upload, Users, BookOpen, GraduationCap, Palmtree, Sparkles
} from 'lucide-react'
import { logout } from '../../store/slices/authSlice'
import { setMobileSidebar, toggleSidebar } from '../../store/slices/uiSlice'
import { fetchNotifications } from '../../store/slices/notificationSlice'

const StudentNav = [
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Today' },
  { to: '/weekly',         icon: CalendarDays,    label: 'Weekly View' },
  { to: '/calendar',       icon: Calendar,        label: 'Calendar' },
  { to: '/notifications',  icon: Bell,            label: 'Notifications' },
  { to: '/profile',        icon: User,            label: 'Profile' },
]

const AdminNav = [
  { to: '/admin',              icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/timetable',    icon: BookOpen,        label: 'Timetable' },
  { to: '/admin/upload',       icon: Upload,          label: 'Upload Excel' },
  { to: '/admin/sections',     icon: GraduationCap,   label: 'Sections' },
  { to: '/admin/holidays',     icon: Palmtree,        label: 'Holidays' },
  { to: '/admin/students',     icon: Users,           label: 'Students' },
]

export default function DashboardLayout({ isAdmin = false }) {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { user }  = useSelector(s => s.auth)
  const { sidebarOpen, mobileSidebarOpen } = useSelector(s => s.ui)
  const { unreadCount } = useSelector(s => s.notifications)

  const navItems = isAdmin ? AdminNav : StudentNav

  useEffect(() => {
    if (user) dispatch(fetchNotifications())
    const interval = setInterval(() => {
      if (user) dispatch(fetchNotifications())
    }, 30000)
    return () => clearInterval(interval)
  }, [user, dispatch])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  // ── Sidebar inner content ────────────────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="px-4 py-5" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 16px rgba(99,102,241,0.35)' }}>
            <span className="text-sm font-black text-white">TT</span>
          </div>
          {sidebarOpen && (
            <div>
              <p className="text-white font-black text-sm leading-none tracking-tight">TimeTable Pro</p>
              <p className="text-indigo-400 text-xs mt-0.5 font-medium">by CampusFlow</p>
            </div>
          )}
        </div>
      </div>

      {/* User info chip */}
      {sidebarOpen && user && (
        <div
          className="mx-3 mt-4 rounded-xl p-3 flex items-center gap-3"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-white text-sm font-bold truncate leading-tight">{user.name}</p>
            <p className="text-slate-500 text-xs truncate mt-0.5">
              {user.role === 'admin' ? '⚙️ Admin' : `Section ${user.section || '—'}`}
            </p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 mt-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={() => dispatch(setMobileSidebar(false))}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 relative ${
                isActive
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-200'
              }`
            }
            style={({ isActive }) => isActive ? {
              background: 'rgba(99,102,241,0.18)',
              border: '1px solid rgba(99,102,241,0.28)',
            } : {
              border: '1px solid transparent',
            }}>
            {({ isActive }) => (
              <>
                <Icon size={17} className={isActive ? 'text-indigo-300' : 'text-slate-600 group-hover:text-slate-300'} />
                {sidebarOpen && (
                  <>
                    <span className="flex-1">{label}</span>
                    {label === 'Notifications' && unreadCount > 0 && (
                      <span
                        className="text-white text-xs font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </>
                )}
                {/* Collapsed dot badge */}
                {!sidebarOpen && label === 'Notifications' && unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button
          onClick={handleLogout}
          className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
          style={{ border: '1px solid transparent', color: '#64748b' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
            e.currentTarget.style.border = '1px solid rgba(239,68,68,0.18)'
            e.currentTarget.style.color = '#f87171'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.border = '1px solid transparent'
            e.currentTarget.style.color = '#64748b'
          }}>
          <LogOut size={17} />
          {sidebarOpen && <span>Sign out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0a0e1a 0%, #0d1224 60%, #0a0f1e 100%)' }}>

      {/* Dot grid — full screen behind everything */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.07) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />

      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className={`hidden lg:flex flex-col backdrop-blur-xl flex-shrink-0 relative z-10 transition-all duration-300 ${sidebarOpen ? 'w-60' : 'w-16'}`}
        style={{ background: 'rgba(10,14,26,0.85)', borderRight: '1px solid rgba(99,102,241,0.1)' }}>
        <SidebarContent />
      </aside>

      {/* ── MOBILE OVERLAY ── */}
      {mobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => dispatch(setMobileSidebar(false))}
        />
      )}

      {/* ── MOBILE SIDEBAR ── */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-full w-60 backdrop-blur-xl z-50 transform transition-transform duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'rgba(10,14,26,0.97)', borderRight: '1px solid rgba(99,102,241,0.15)' }}>
        <SidebarContent />
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">

        {/* Top bar */}
        <header
          className="h-14 flex items-center justify-between px-4 lg:px-5 flex-shrink-0"
          style={{
            background: 'rgba(10,14,26,0.75)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(99,102,241,0.1)'
          }}>

          {/* Left: hamburger + date */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.innerWidth < 1024) dispatch(setMobileSidebar(true))
                else dispatch(toggleSidebar())
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-indigo-400 transition-all duration-150"
              style={{ border: '1px solid transparent' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(99,102,241,0.1)'
                e.currentTarget.style.border = '1px solid rgba(99,102,241,0.2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.border = '1px solid transparent'
              }}>
              <Menu size={18} />
            </button>
            <p className="hidden sm:block text-xs text-slate-600 font-mono">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Right: bell + avatar */}
          <div className="flex items-center gap-2">
            <NavLink
              to={isAdmin ? '/admin' : '/notifications'}
              className="relative p-2 rounded-xl text-slate-500 hover:text-indigo-400 transition-all duration-150"
              style={{ border: '1px solid transparent' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(99,102,241,0.1)'
                e.currentTarget.style.border = '1px solid rgba(99,102,241,0.2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.border = '1px solid transparent'
              }}>
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[10px] font-black flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>

            <NavLink to={isAdmin ? '/admin' : '/profile'}>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm cursor-pointer transition-all duration-150 hover:opacity-80"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 0 12px rgba(99,102,241,0.3)'
                }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}