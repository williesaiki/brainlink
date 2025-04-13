// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCsC69twn_ehvlxwjIE1u3mCHS4OiEw5ds",
  authDomain: "the-estate-hub.firebaseapp.com",
  projectId: "the-estate-hub",
  storageBucket: "the-estate-hub.appspot.com",
  messagingSenderId: "904129270236",
  appId: "1:904129270236:web:bee663ceacbf8210ceff19",
  measurementId: "G-GEMH1F52Y1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);