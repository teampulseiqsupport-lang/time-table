import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import toast from 'react-hot-toast'

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials)
    localStorage.setItem('token', data.token)
    return data
  } catch (err) {
    return rejectWithValue({
      status: err.response?.status,
      message: err.response?.data?.message || 'Login failed'
    })
  }
})

export const googleLoginUser = createAsyncThunk('auth/google', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/google', payload)
    localStorage.setItem('token', data.token)
    return data
  } catch (err) {
    return rejectWithValue({
      status: err.response?.status,
      message: err.response?.data?.message || 'Google login failed'
    })
  }
})

export const googleRegisterUser = createAsyncThunk('auth/googleRegister', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/google/register', payload)
    localStorage.setItem('token', data.token)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Google registration failed')
  }
})

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', userData)
    localStorage.setItem('token', data.token)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed')
  }
})

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me')
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch user')
  }
})

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/forgot-password', payload)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to send reset link')
  }
})

export const resetPassword = createAsyncThunk('auth/resetPassword', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/reset-password', payload)
    localStorage.setItem('token', data.token)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Password reset failed')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
    initialized: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.initialized = true
      localStorage.removeItem('token')
    },
    clearError: (state) => { state.error = null },
    setInitialized: (state) => { state.initialized = true },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.initialized = true
        toast.success(`Welcome back, ${action.payload.user.name.split(' ')[0]}!`)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || action.payload
        toast.error(state.error)
      })
      .addCase(googleLoginUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(googleLoginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.initialized = true
        toast.success(`Welcome, ${action.payload.user.name.split(' ')[0]}!`)
      })
      .addCase(googleLoginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || action.payload
        toast.error(state.error)
      })
      .addCase(googleRegisterUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(googleRegisterUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.initialized = true
        toast.success('Registration successful! Welcome aboard!')
      })
      .addCase(googleRegisterUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload)
      })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.initialized = true
        toast.success('Registration successful! Welcome aboard!')
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload)
      })
      .addCase(forgotPassword.pending, (state) => { state.loading = true; state.error = null })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false
        toast.success(action.payload.message || 'Reset link sent')
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload)
      })
      .addCase(resetPassword.pending, (state) => { state.loading = true; state.error = null })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.initialized = true
        toast.success('Password reset successful')
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload)
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.initialized = true
      })
      .addCase(fetchMe.rejected, (state) => {
        state.token = null
        state.initialized = true
        localStorage.removeItem('token')
      })
  },
})

export const { logout, clearError, setInitialized } = authSlice.actions
export default authSlice.reducer
