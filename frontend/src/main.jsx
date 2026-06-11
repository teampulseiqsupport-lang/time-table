import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { store } from './store'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#111B3E',
              color: '#F8FAFC',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#0A0F1E' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#0A0F1E' },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)
