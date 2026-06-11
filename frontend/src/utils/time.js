// Convert "08:00 AM" to minutes from midnight
export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0
  const clean = timeStr.toString().trim().toUpperCase()
  const match = clean.match(/(\d+):(\d+)\s*(AM|PM)/)
  if (!match) return 0
  let hours = parseInt(match[1])
  const minutes = parseInt(match[2])
  const ampm = match[3]
  if (ampm === 'PM' && hours !== 12) hours += 12
  if (ampm === 'AM' && hours === 12) hours = 0
  return hours * 60 + minutes
}

// Get current IST time in minutes
export const getCurrentISTMinutes = () => {
  const now = new Date()
  // Convert to IST (UTC+5:30)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const ist = new Date(utc + 3600000 * 5.5)
  return ist.getHours() * 60 + ist.getMinutes()
}

// Get IST time object
export const getISTTime = () => {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  return new Date(utc + 3600000 * 5.5)
}

// Get IST day name
export const getISTDayName = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[getISTTime().getDay()]
}

// Format minutes to "HH:MM"
export const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// Format countdown
export const formatCountdown = (totalSeconds) => {
  if (totalSeconds <= 0) return '00:00:00'
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// Format minutes to readable
export const formatMinutes = (mins) => {
  if (mins <= 0) return 'Now'
  if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''}`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

// Get greeting based on hour
export const getGreeting = () => {
  const hour = getISTTime().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  if (hour < 20) return 'Good Evening'
  return 'Good Night'
}

// Check if entry is ongoing
export const isOngoing = (entry) => {
  const current = getCurrentISTMinutes()
  const start = timeToMinutes(entry.startTime)
  const end = timeToMinutes(entry.endTime)
  return current >= start && current < end
}

// Check if entry is upcoming (next)
export const getUpcomingEntry = (entries) => {
  const current = getCurrentISTMinutes()
  return entries
    .filter(e => e.type !== 'Free' && !e.isCancelled)
    .find(e => timeToMinutes(e.startTime) > current) || null
}

// Get ongoing entry
export const getOngoingEntry = (entries) => {
  return entries.find(e => isOngoing(e) && e.type !== 'Free' && !e.isCancelled) || null
}

// Time progress percentage (for arc)
export const getClassProgress = (entry) => {
  const current = getCurrentISTMinutes()
  const start = timeToMinutes(entry.startTime)
  const end = timeToMinutes(entry.endTime)
  const total = end - start
  if (total <= 0) return 0
  const elapsed = current - start
  return Math.min(100, Math.max(0, (elapsed / total) * 100))
}

// Format date for display
export const formatDate = (dateStr) => {
  const date = dateStr ? new Date(dateStr) : new Date()
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Get today as YYYY-MM-DD in IST
export const getTodayIST = () => {
  const ist = getISTTime()
  return `${ist.getFullYear()}-${String(ist.getMonth() + 1).padStart(2, '0')}-${String(ist.getDate()).padStart(2, '0')}`
}

// Minutes before next class starts
export const minutesUntilClass = (entry) => {
  const current = getCurrentISTMinutes()
  return timeToMinutes(entry.startTime) - current
}
