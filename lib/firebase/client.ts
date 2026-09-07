import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const VERIFIED_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBUdd0SovUAwPdTWtFTHsprxKpCqrv8OZ0',
  authDomain: 'equipment-borrow-4942d.firebaseapp.com',
  projectId: 'equipment-borrow-4942d',
  storageBucket: 'equipment-borrow-4942d.firebasestorage.app',
  messagingSenderId: '253989520099',
  appId: '1:253989520099:web:1b9b31fe4f58edc2e33bd6',
  measurementId: 'G-DLRXTQ6Q6Y',
};

function cleanConfig(val: string | undefined, fallback: string): string {
  if (!val) return fallback;
  const trimmed = val.trim().replace(/^["']|["']$/g, '').trim();
  if (
    !trimmed ||
    trimmed === 'undefined' ||
    trimmed === 'null' ||
    trimmed.startsWith('your-') ||
    trimmed.includes(' ') ||
    trimmed === 'AIzaSyBUdd0SovUAwPdTWtFTHsprxKpcQrv8OZO' ||
    trimmed.toLowerCase() === 'aizasybudd0sovuawpdtwfthsprxkpcqrv8oz0'
  ) {
    return fallback;
  }
  return trimmed;
}

const firebaseConfig = {
  apiKey: cleanConfig(process.env.NEXT_PUBLIC_FIREBASE_API_KEY, VERIFIED_FIREBASE_CONFIG.apiKey),
  authDomain: cleanConfig(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, VERIFIED_FIREBASE_CONFIG.authDomain),
  projectId: cleanConfig(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, VERIFIED_FIREBASE_CONFIG.projectId),
  storageBucket: cleanConfig(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, VERIFIED_FIREBASE_CONFIG.storageBucket),
  messagingSenderId: cleanConfig(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, VERIFIED_FIREBASE_CONFIG.messagingSenderId),
  appId: cleanConfig(process.env.NEXT_PUBLIC_FIREBASE_APP_ID, VERIFIED_FIREBASE_CONFIG.appId),
  measurementId: cleanConfig(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, VERIFIED_FIREBASE_CONFIG.measurementId),
};

// Initialize Firebase (Singleton pattern to prevent duplicate initialization during hot reloads)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
