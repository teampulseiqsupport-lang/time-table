let admin;
let firebaseApp = null;
let firebaseInitialized = false;

// Try to load firebase-admin
try {
  admin = require('firebase-admin');
} catch (error) {
  console.error('❌ Failed to load firebase-admin module:', error.message);
  admin = null;
}

const initializeFirebase = () => {
  try {
    // Skip if already initialized
    if (firebaseInitialized) {
      return;
    }

    // Validate firebase-admin module loaded
    if (!admin) {
      console.warn('⚠️  Firebase Admin SDK not available. FCM notifications will be disabled.');
      return;
    }

    // Check if FIREBASE_SERVICE_ACCOUNT_JSON is provided
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      try {
        let serviceAccount;
        try {
          serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        } catch (jsonError) {
          console.error('❌ Firebase Service Account JSON parse error:', jsonError.message);
          console.warn('⚠️  FCM notifications will be disabled.');
          return;
        }
        
        if (!serviceAccount || typeof serviceAccount !== 'object') {
          throw new Error('Invalid service account object');
        }

        // Firebase Admin SDK v11 uses admin.credential.cert()
        firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID
        });
        
        firebaseInitialized = true;
        console.log('✅ Firebase Admin initialized successfully');
      } catch (error) {
        console.error('❌ Firebase initialization error:', error.message);
        console.warn('⚠️  FCM notifications will be disabled.');
      }
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        // Using credential file path
        // Firebase Admin SDK v11 uses admin.credential.applicationDefault()
        firebaseApp = admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: process.env.FIREBASE_PROJECT_ID
        });
        
        firebaseInitialized = true;
        console.log('✅ Firebase Admin initialized with default credentials');
      } catch (error) {
        console.error('❌ Firebase initialization error:', error.message);
        console.warn('⚠️  FCM notifications will be disabled.');
      }
    } else {
      console.warn('⚠️  Firebase credentials not found. FCM notifications will be disabled.');
      console.warn('   Set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS env vars');
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
  }
};

const getFirebaseAdmin = () => {
  if (!firebaseInitialized || !firebaseApp) {
    console.warn('⚠️  Firebase not initialized');
    return null;
  }
  // Return the initialized app instance, which has messaging() method
  return firebaseApp;
};

const isFirebaseReady = () => firebaseInitialized && firebaseApp !== null;

module.exports = { initializeFirebase, getFirebaseAdmin, isFirebaseReady };
