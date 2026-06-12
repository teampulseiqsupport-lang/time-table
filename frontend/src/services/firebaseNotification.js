import { initializeApp, getApps, getApp } from 'firebase/app'
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
let serviceWorkerRegistration = null
let tokenSyncInProgress = false

const hasFirebaseConfig = () => (
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId
)

const getVapidKey = () => import.meta.env.VITE_FIREBASE_VAPID_KEY?.trim()

const hasValidVapidKey = () => {
  const vapidKey = getVapidKey()

  if (!vapidKey) return false
  if (vapidKey.startsWith('G-')) return false

  return vapidKey.length > 40
}

const appRouteFromNotificationRoute = (route) => (
  route === '/student/dashboard' ? '/dashboard' : route || '/dashboard'
)

const initializeFirebaseMessaging = async () => {
  try {
    if (firebaseApp) return messaging

    if (!hasFirebaseConfig()) {
      console.warn('Firebase web config is missing. Push notifications are disabled.')
      return null
    }

    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers are not supported in this browser.')
      return null
    }

    if (!('Notification' in window)) {
      console.warn('Notifications are not supported in this browser.')
      return null
    }

    firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)
    serviceWorkerRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    })
    messaging = getMessaging(firebaseApp)

    onMessage(messaging, (payload) => {
      const notificationTitle = payload.notification?.title || 'TimeTable Pro'
      const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/icon.svg',
        badge: '/badge.svg',
        tag: payload.data?.type || 'notification',
        data: payload.data || {},
        requireInteraction: true,
      }

      if (Notification.permission === 'granted') {
        const notification = new Notification(notificationTitle, notificationOptions)
        notification.onclick = () => {
          window.focus()
          window.location.assign(appRouteFromNotificationRoute(payload.data?.route))
          notification.close()
        }
      }
    })

    return messaging
  } catch (error) {
    console.error('Firebase messaging initialization failed:', error)
    return null
  }
}

const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) return false

    if (!hasValidVapidKey()) {
      console.error('Firebase VAPID key is missing or invalid. Set VITE_FIREBASE_VAPID_KEY to the Web Push certificate key from Firebase Console > Cloud Messaging.')
      return false
    }

    if (Notification.permission === 'denied') return false

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return false
    }

    await getFCMToken()
    return true
  } catch (error) {
    console.error('Error requesting notification permission:', error)
    return false
  }
}

const getFCMToken = async () => {
  try {
    if (tokenSyncInProgress) return null
    tokenSyncInProgress = true

    if (!hasValidVapidKey()) {
      console.error('Cannot create FCM token: VITE_FIREBASE_VAPID_KEY is missing or invalid.')
      return null
    }

    if (!messaging) await initializeFirebaseMessaging()
    if (!messaging) return null

    const token = await getToken(messaging, {
      vapidKey: getVapidKey(),
      serviceWorkerRegistration,
    })

    if (!token) return null

    await api.post('/auth/save-fcm-token', { fcmToken: token })
    return token
  } catch (error) {
    console.error('Error getting or saving FCM token:', error)
    return null
  } finally {
    tokenSyncInProgress = false
  }
}

export { initializeFirebaseMessaging, requestNotificationPermission, getFCMToken }
