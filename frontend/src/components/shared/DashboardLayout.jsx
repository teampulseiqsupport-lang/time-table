import React, { useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  LayoutDashboard, Calendar, CalendarDays, Bell, User, LogOut,
  Menu, X, Upload, Users, BookOpen, GraduationCap, Sun,
  ChevronRight, Settings, Palmtree
} from 'lucide-react'
import { logout } from '../../store/slices/authSlice'
import { setMobileSidebar, toggleSidebar } from '../../store/slices/uiSlice'
import { fetchNotifications } from '../../store/slices/notificationSlice'

const StudentNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Today' },
  { to: '/weekly', icon: CalendarDays, label: 'Weekly View' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/profile', icon: User, label: 'Profile' },
]

const AdminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/timetable', icon: BookOpen, label: 'Timetable' },
  { to: '/admin/upload', icon: Upload, label: 'Upload Excel' },
  { to: '/admin/sections', icon: GraduationCap, label: 'Sections' },
  { to: '/admin/holidays', icon: Palmtree, label: 'Holidays' },
  { to: '/admin/students', icon: Users, label: 'Students' },
]

export default function DashboardLayout({ isAdmin = false }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(s => s.auth)
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-indigo-500/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <span className="text-lg">🎓</span>
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="font-bold text-white text-sm leading-none">TimeTable</h1>
              <p className="text-indigo-400 text-xs font-mono mt-0.5">Pro</p>
            </div>
          )}
        </div>
      </div>

      {/* User info */}
      {sidebarOpen && user && (
        <div className="p-4 mx-3 mt-4 rounded-xl bg-indigo-500/8 border border-indigo-500/15">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-semibold truncate">{user.name}</p>
              <p className="text-slate-400 text-xs truncate">
                {user.role === 'admin' ? '⚙️ Administrator' : `Section: ${user.section || 'Not set'}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 mt-2 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            onClick={() => dispatch(setMobileSidebar(false))}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} />
            {sidebarOpen && (
              <>
                <span className="flex-1">{label}</span>
                {label === 'Notifications' && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </>
            )}
            {!sidebarOpen && label === 'Notifications' && unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-indigo-500/10">
        <button onClick={handleLogout} className="sidebar-link w-full text-red-400/70 hover:text-red-400 hover:bg-red-500/10">
          <LogOut size={18} />
          {sidebarOpen && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-navy-900 bg-grid overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-navy-800/80 backdrop-blur-xl border-r border-indigo-500/10 transition-all duration-300 flex-shrink-0 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => dispatch(setMobileSidebar(false))}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-navy-800/95 backdrop-blur-xl border-r border-indigo-500/10 z-50 transform transition-transform duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-navy-800/50 backdrop-blur-xl border-b border-indigo-500/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.innerWidth < 1024) dispatch(setMobileSidebar(true))
                else dispatch(toggleSidebar())
              }}
              className="p-2 rounded-lg hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <p className="text-xs text-slate-500 font-mono">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NavLink to={isAdmin ? '/admin' : '/notifications'} className="relative p-2 rounded-lg hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 transition-colors">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </NavLink>
            <NavLink to={isAdmin ? '/admin' : '/profile'} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm cursor-pointer">
              {user?.name?.charAt(0).toUpperCase()}
            </NavLink>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
