/**
 * Firebase Initialization Service
 * Handles Firebase app and Firestore initialization
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from '../../config/firebase.config';

let app = null;
let db = null;

/**
 * Initialize Firebase application
 * @returns {FirebaseApp} Initialized Firebase app instance
 */
export const initializeFirebase = () => {
  if (!app) {
    app = initializeApp(FIREBASE_CONFIG);
  }
  return app;
};

/**
 * Get Firestore database instance
 * @returns {Firestore} Firestore database instance
 */
export const getDatabase = () => {
  if (!db) {
    const firebaseApp = initializeFirebase();
    db = getFirestore(firebaseApp);
  }
  return db;
};

/**
 * Check if Firebase is available
 * @returns {boolean} True if Firebase is initialized
 */
export const isFirebaseAvailable = () => {
  try {
    return !!getDatabase();
  } catch {
    return false;
  }
};
