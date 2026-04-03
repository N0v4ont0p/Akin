import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAr4oELoBO4l-8vZvzPLPJ5D3XjvHltySk",
  authDomain: "likewise-d1005.firebaseapp.com",
  projectId: "likewise-d1005",
  storageBucket: "likewise-d1005.firebasestorage.app",
  messagingSenderId: "906339129998",
  appId: "1:906339129998:web:3b48093f4c0d17641547df",
  measurementId: "G-XSC01VCM8Y",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
