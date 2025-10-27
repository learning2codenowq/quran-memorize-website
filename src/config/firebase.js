// Import Firebase modules
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyASSE8GIs-OZnqADAH46yO0P9M7XugAL1w",
  authDomain: "quran-memorize-cf544.firebaseapp.com",
  projectId: "quran-memorize-cf544",
  storageBucket: "quran-memorize-cf544.firebasestorage.app",
  messagingSenderId: "244527732530",
  appId: "1:244527732530:web:6c51ca480c79509fee692b",
  measurementId: "G-C1BESQ78FH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;