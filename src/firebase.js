import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBOueJo2hsy0ehLZiPR1quwTJ-JOiogvYY",
  authDomain: "mindcooked.firebaseapp.com",
  projectId: "mindcooked",
  storageBucket: "mindcooked.firebasestorage.app",
  messagingSenderId: "629083725038",
  appId: "1:629083725038:web:157cfad58fa149eab6e7ff",
  measurementId: "G-0XBGY76DMX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

