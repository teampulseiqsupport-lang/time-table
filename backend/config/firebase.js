const admin = require('firebase-admin');

let firebaseInitialized = false;

const initializeFirebase = () => {
  try {
    // Check if FIREBASE_SERVICE_ACCOUNT_JSON is provided
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      
      firebaseInitialized = true;
      console.log('✅ Firebase Admin initialized successfully');
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Using credential file path
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      
      firebaseInitialized = true;
      console.log('✅ Firebase Admin initialized with default credentials');
    } else {
      console.warn('⚠️  Firebase credentials not found. FCM notifications will be disabled.');
      console.warn('   Set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS env vars');
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
  }
};

const getFirebaseAdmin = () => {
  if (!firebaseInitialized) {
    console.warn('⚠️  Firebase not initialized');
    return null;
  }
  return admin;
};

const isFirebaseReady = () => firebaseInitialized;

module.exports = { initializeFirebase, getFirebaseAdmin, isFirebaseReady };
