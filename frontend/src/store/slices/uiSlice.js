import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: true,
    mobileSidebarOpen: false,
    notificationsOpen: false,
    darkMode: true,
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen },
    setMobileSidebar: (state, action) => { state.mobileSidebarOpen = action.payload },
    toggleNotifications: (state) => { state.notificationsOpen = !state.notificationsOpen },
    setNotificationsOpen: (state, action) => { state.notificationsOpen = action.payload },
  },
})

export const { toggleSidebar, setMobileSidebar, toggleNotifications, setNotificationsOpen } = uiSlice.actions
export default uiSlice.reducer
