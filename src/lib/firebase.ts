
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "equiporandomizer",
  appId: "1:818997044556:web:ca6907bb0d69ab3f08dbe9",
  storageBucket: "equiporandomizer.firebasestorage.app",
  apiKey: "AIzaSyAOQUM2fHu3Lw5_paQbkJiaW9qrmA_ldCo",
  authDomain: "equiporandomizer.firebaseapp.com",
  messagingSenderId: "818997044556",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
