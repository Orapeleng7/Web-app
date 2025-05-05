// src/firebase/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage"; // Firebase Storage for image uploads

// ✅ Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIqM3mgZF1BBBLT0ewExtfDJBclSEuoH4",
  authDomain: "website-2be73.firebaseapp.com",
  projectId: "website-2be73",
  storageBucket: "website-2be73.appspot.com",
  messagingSenderId: "1049916225602",
  appId: "1:1049916225602:web:d66c002fed2d915b6a55db",
  measurementId: "G-6LQQHBC6C2"
};

// ✅ Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Initialize Services
const db = getFirestore(app);         // Firestore database
const auth = getAuth(app);            // Firebase Authentication
const analytics = getAnalytics(app);  // Firebase Analytics
const storage = getStorage(app);      // Firebase Storage

// ✅ Export services for use in your app
export { app, db, auth, analytics, storage };
