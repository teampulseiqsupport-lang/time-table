import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/notifications')
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed')
  }
})

export const markAllRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await api.put('/notifications/read-all')
    return true
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed')
  }
})

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    loading: false,
    unreadCount: 0,
  },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload)
      state.unreadCount++
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.notifications || []
        state.unreadCount = state.items.filter(n => !n.isRead).length
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.items = state.items.map(n => ({ ...n, isRead: true }))
        state.unreadCount = 0
      })
  },
})

export const { addNotification } = notificationSlice.actions
export default notificationSlice.reducer
