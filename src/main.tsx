import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);