
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "equiporandomizer",
  appId: "1:818997044556:web:ca6907bb0d69ab3f08dbe9",
  storageBucket: "equiporandomizer.firebasestorage.app",
  apiKey: "AIzaSyAOQUM2fHu3Lw5_paQbkJiaW9qrmA_ldCo",
  authDomain: "equiporandomizer.firebaseapp.com",
  messagingSenderId: "818997044556",
  measurementId: "G-D3P3S7V1P4"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);

export { app, auth, db };
