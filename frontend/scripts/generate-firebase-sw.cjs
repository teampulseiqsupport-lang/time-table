const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const outputPath = path.join(rootDir, 'public', 'firebase-messaging-sw.js');

const parseEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return {};

  return fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .reduce((env, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return env;

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) return env;

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '');
      env[key] = value;
      return env;
    }, {});
};

const localEnv = parseEnvFile(envPath);
const readEnv = (key) => process.env[key] || localEnv[key] || '';

const firebaseConfig = {
  apiKey: readEnv('VITE_FIREBASE_API_KEY'),
  authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: readEnv('VITE_FIREBASE_PROJECT_ID'),
  messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: readEnv('VITE_FIREBASE_APP_ID'),
};

const serviceWorker = `importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};
const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId
);

const appRouteFromNotificationRoute = (route) => (
  route === '/student/dashboard' ? '/dashboard' : route || '/dashboard'
);

if (hasFirebaseConfig) {
  firebase.initializeApp(firebaseConfig);

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification?.title || 'TimeTable Pro';
    const data = payload.data || {};

    return self.registration.showNotification(notificationTitle, {
      body: payload.notification?.body || '',
      icon: '/icon.svg',
      badge: '/badge.svg',
      tag: data.type || 'notification',
      data,
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'View Timetable' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });
  });
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const targetUrl = new URL(
    appRouteFromNotificationRoute(event.notification.data?.route),
    self.location.origin
  ).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client && new URL(client.url).origin === self.location.origin) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      if (clients.openWindow) return clients.openWindow(targetUrl);
      return undefined;
    })
  );
});
`;

fs.writeFileSync(outputPath, serviceWorker);
console.log('Generated public/firebase-messaging-sw.js from VITE_FIREBASE_* env values.');
