import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCrjzfaEZBoSsoowDyKB28-Kfs_MrnDIzA",
  authDomain: "congressionalappchalleng-7c20f.firebaseapp.com",
  projectId: "congressionalappchalleng-7c20f",
  storageBucket: "congressionalappchalleng-7c20f.firebasestorage.app",
  messagingSenderId: "177251977308",
  appId: "1:177251977308:web:0f86c8ace36e587dc3be99",
  measurementId: "G-5YYLWZCEDX"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);