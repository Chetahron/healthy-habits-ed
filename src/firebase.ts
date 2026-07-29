// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Credentials for your "congressionalappchalleng-7c20f" Firebase project
const firebaseConfig = {
  apiKey: "AIzaSyCrjzfaEZBoSsoowDyKB28-Kfs_MrnDIzA",
  authDomain: "congressionalappchalleng-7c20f.firebaseapp.com",
  projectId: "congressionalappchalleng-7c20f",
  storageBucket: "congressionalappchalleng-7c20f.firebasestorage.app",
  messagingSenderId: "177251977308",
  appId: "1:177251977308:web:0f86c8ace36e587dc3be99",
  measurementId: "G-5YYLWZCEDX"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize and export Firestore database for App.tsx
export const db = getFirestore(app);