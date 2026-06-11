import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import api from './api'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
}

let firebaseApp = null
let messaging = null

const initializeFirebaseMessaging = async () => {
  try {
    if (firebaseApp) return messaging

    // Initialize Firebase
    firebaseApp = initializeApp(firebaseConfig)
    console.log('✅ Firebase initialized')

    // Check if browser supports notifications
    if (!('serviceWorker' in navigator)) {
      console.warn('⚠️ Service Workers not supported')
      return null
    }

    if (!('Notification' in window)) {
      console.warn('⚠️ Notifications not supported')
      return null
    }

    // Register service worker
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      })
      console.log('✅ Service Worker registered')
    } catch (err) {
      console.error('❌ Service Worker registration failed:', err)
    }

    // Initialize messaging
    messaging = getMessaging(firebaseApp)
    console.log('✅ Firebase Messaging initialized')

    // Listen for foreground messages
    onMessage(messaging, (payload) => {
      console.log('📬 Foreground message received:', payload)
      
      const notificationTitle = payload.notification?.title || 'TimeTable Pro'
      const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/icon.svg',
        badge: '/badge.svg',
        tag: payload.data?.type || 'default',
        data: payload.data,
      }

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notificationTitle, notificationOptions)
      }
    })

    return messaging
  } catch (error) {
    console.error('❌ Firebase initialization error:', error)
    return null
  }
}

const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) {
      console.warn('⚠️ Notifications not supported in this browser')
      return false
    }

    if (Notification.permission === 'granted') {
      console.log('✅ Notification permission already granted')
      await getFCMToken()
      return true
    }

    if (Notification.permission === 'denied') {
      console.warn('⚠️ Notification permission denied by user')
      return false
    }

    // Request permission
    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted')
      await getFCMToken()
      return true
    } else {
      console.warn('⚠️ Notification permission denied')
      return false
    }
  } catch (error) {
    console.error('❌ Error requesting notification permission:', error)
    return false
  }
}

const getFCMToken = async () => {
  try {
    if (!messaging) {
      await initializeFirebaseMessaging()
    }

    if (!messaging) {
      console.warn('⚠️ Messaging not initialized')
      return null
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    })

    if (token) {
      console.log('✅ FCM Token received:', token.substring(0, 20) + '...')
      
      // Save token to backend
      try {
        await api.post('/auth/save-fcm-token', { fcmToken: token })
        console.log('✅ FCM token saved to backend')
      } catch (err) {
        console.error('❌ Failed to save FCM token:', err)
      }

      return token
    } else {
      console.warn('⚠️ No FCM token received')
      return null
    }
  } catch (error) {
    console.error('❌ Error getting FCM token:', error)
    return null
  }
}

export { initializeFirebaseMessaging, requestNotificationPermission, getFCMToken }
