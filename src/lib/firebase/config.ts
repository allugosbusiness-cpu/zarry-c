import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAJ9QCNrEZCWxRscgNVfCCnfdOtiTHKlBg",
  authDomain: "zarry-c.firebaseapp.com",
  projectId: "zarry-c",
  // storageBucket removed intentionally - uploads go server-side via /api/upload
  // to avoid CORS issues and prevent Firebase Storage SDK auto-initialization
  messagingSenderId: "54458977825",
  appId: "1:54458977825:web:cdd5b73691852163ee5d60",
  measurementId: "G-55PNZCGKL6",
};

// Initialize Firebase (only once)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };