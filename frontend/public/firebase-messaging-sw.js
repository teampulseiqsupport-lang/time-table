// Firebase Cloud Messaging Service Worker
// Place this file at: frontend/public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: 'AIzaSyCayeaMJpRZgJrAm04BrEZcSo1ZKUJhNnY',
  authDomain: 'timetable-system-443cd.firebaseapp.com',
  projectId: 'timetable-system-443cd',
  messagingSenderId: '992922624403',
  appId: '1:992922624403:web:034356609b40b510ba0866',
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'TimeTable Pro';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icon.svg',
    badge: '/badge.svg',
    tag: payload.data?.type || 'default',
    data: payload.data || {},
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'View Timetable' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow('/notifications');
        }
      })
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', function(event) {
  console.log('[firebase-messaging-sw.js] Notification closed');
});
