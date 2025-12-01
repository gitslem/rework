import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abc123',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-ABC123'
};

// Check if Firebase is properly configured
const isConfigured = process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
                     process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'your-api-key';

// Initialize Firebase only in browser and when configured
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let analytics: Analytics | null = null;

// Lazy initialization function
function initializeFirebase() {
  if (typeof window === 'undefined' || !isConfigured) {
    return;
  }

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    analytics = getAnalytics(app);

    // CRITICAL FOR iOS: Explicitly set auth persistence to local storage
    // This helps with Chrome iOS which has stricter privacy controls
    if (auth) {
      setPersistence(auth, browserLocalPersistence).catch((error) => {
        console.error('Failed to set auth persistence:', error);
      });
    }
  } else {
    app = getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    analytics = getAnalytics(app);
  }
}

// Getters that ensure Firebase is initialized
export function getFirebaseApp(): FirebaseApp {
  if (!app) initializeFirebase();
  if (!app) throw new Error('Firebase is not configured. Please add your Firebase credentials to .env.local');
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) initializeFirebase();
  if (!auth) throw new Error('Firebase Auth is not configured. Please add your Firebase credentials to .env.local');
  return auth;
}

export function getFirebaseFirestore(): Firestore {
  if (!db) initializeFirebase();
  if (!db) throw new Error('Firebase Firestore is not configured. Please add your Firebase credentials to .env.local');
  return db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) initializeFirebase();
  if (!storage) throw new Error('Firebase Storage is not configured. Please add your Firebase credentials to .env.local');
  return storage;
}

export function getFirebaseAnalytics(): Analytics | null {
  if (typeof window === 'undefined') return null;
  if (!analytics) initializeFirebase();
  return analytics;
}

// Legacy exports for backwards compatibility
export { app, auth, db, storage, analytics };

// Check if Firebase is ready
export const isFirebaseConfigured = isConfigured;
