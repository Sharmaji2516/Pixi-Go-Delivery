import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// TODO: Replace this config with the one shown in your Firebase Console
// in the next step ("Add Firebase SDK")!
export const firebaseConfig = {
  apiKey: "AIzaSyBuCFaDfli0PTF2xyROHuR8qfHkb1H4oDM",
  authDomain: "pixi-go-delivery.firebaseapp.com",
  projectId: "pixi-go-delivery",
  storageBucket: "pixi-go-delivery.firebasestorage.app",
  messagingSenderId: "985286465902",
  appId: "1:985286465902:web:9235c2ab2572493e8d897f",
  measurementId: "G-FYL3PLNCK6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export instances to use in App.jsx
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
