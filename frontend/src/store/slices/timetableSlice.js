import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Simple in-memory cache for timetable requests
const timetableCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const fetchTimetable = createAsyncThunk('timetable/fetch', async (date, { rejectWithValue, getState }) => {
  try {
    const params = date ? { date } : {}
    const cacheKey = date || 'today';
    const cachedData = timetableCache.get(cacheKey);
    
    // Return cached data if fresh
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data;
    }
    
    const { data } = await api.get('/timetable', { params })
    
    // Store in cache
    timetableCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch timetable')
  }
})

export const fetchWeeklyTimetable = createAsyncThunk('timetable/fetchWeekly', async (_, { rejectWithValue }) => {
  try {
    const cacheKey = 'weekly';
    const cachedData = timetableCache.get(cacheKey);
    
    // Return cached data if fresh
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data;
    }
    
    const { data } = await api.get('/timetable/week')
    
    // Store in cache
    timetableCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed')
  }
})

export const fetchAllTimetable = createAsyncThunk('timetable/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/timetable/all', { params })
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed')
  }
})

const timetableSlice = createSlice({
  name: 'timetable',
  initialState: {
    entries: [],
    weekly: {},
    allEntries: [],
    loading: false,
    weeklyLoading: false,
    error: null,
    holiday: null,
    currentDate: null,
    currentDay: null,
    showRealtimeStatus: false,
    view: 'today', // 'today' | 'weekly'
    selectedDate: null,
  },
  reducers: {
    setView: (state, action) => { state.view = action.payload },
    setSelectedDate: (state, action) => { state.selectedDate = action.payload },
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTimetable.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchTimetable.fulfilled, (state, action) => {
        state.loading = false
        state.entries = action.payload.timetable || []
        state.holiday = action.payload.holiday || null
        state.currentDate = action.payload.date
        state.currentDay = action.payload.day
        state.showRealtimeStatus = Boolean(action.payload.showRealtimeStatus)
      })
      .addCase(fetchTimetable.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchWeeklyTimetable.pending, (state) => { state.weeklyLoading = true })
      .addCase(fetchWeeklyTimetable.fulfilled, (state, action) => {
        state.weeklyLoading = false
        state.weekly = action.payload.timetable || {}
      })
      .addCase(fetchWeeklyTimetable.rejected, (state) => { state.weeklyLoading = false })
      .addCase(fetchAllTimetable.fulfilled, (state, action) => {
        state.allEntries = action.payload.timetable || []
      })
  },
})

export const { setView, setSelectedDate, clearError } = timetableSlice.actions
export default timetableSlice.reducer
