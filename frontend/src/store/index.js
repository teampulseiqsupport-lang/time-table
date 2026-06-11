import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import timetableReducer from './slices/timetableSlice'
import notificationReducer from './slices/notificationSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    timetable: timetableReducer,
    notifications: notificationReducer,
    ui: uiReducer,
  },
})
