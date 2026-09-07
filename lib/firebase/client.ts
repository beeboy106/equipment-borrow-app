import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

function cleanConfig(val: string | undefined, fallback: string): string {
  if (!val) return fallback;
  const trimmed = val.trim().replace(/^["']|["']$/g, '').trim();
  if (
    !trimmed ||
    trimmed === 'undefined' ||
    trimmed === 'null' ||
    trimmed.startsWith('your-') ||
    trimmed.includes(' ')
  ) {
    return fallback;
  }
  return trimmed;
}

const firebaseConfig = {
  apiKey: cleanConfig(process.env.NEXT_PUBLIC_FIREBASE_API_KEY, 'AIzaSyBUdd0SovUAwPdTWtFTHsprxKpCqrv8OZ0'),
  authDomain: cleanConfig(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, 'equipment-borrow-4942d.firebaseapp.com'),
  projectId: cleanConfig(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, 'equipment-borrow-4942d'),
  storageBucket: cleanConfig(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, 'equipment-borrow-4942d.firebasestorage.app'),
  messagingSenderId: cleanConfig(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, '253989520099'),
  appId: cleanConfig(process.env.NEXT_PUBLIC_FIREBASE_APP_ID, '1:253989520099:web:1b9b31fe4f58edc2e33bd6'),
  measurementId: cleanConfig(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, 'G-DLRXTQ6Q6Y'),
};

// Initialize Firebase (Singleton pattern to prevent duplicate initialization during hot reloads)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
