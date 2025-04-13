import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsC69twn_ehvlxwjIE1u3mCHS4OiEw5ds",
  authDomain: "the-estate-hub.firebaseapp.com",
  projectId: "the-estate-hub",
  storageBucket: "the-estate-hub.appspot.com",
  messagingSenderId: "904129270236",
  appId: "1:904129270236:web:bee663ceacbf8210ceff19",
  measurementId: "G-GEMH1F52Y1"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics only in production-like environments
export let analytics;
if (process.env.NODE_ENV !== 'development' && 
    !window.location.host.includes('stackblitz') && 
    !window.location.host.includes('webcontainer')) {
  analytics = getAnalytics(app);
}

export const storage = getStorage(app);

// Export types
export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  client_type: 'buyer' | 'seller';
  locations: string[];
  price_min: number | null;
  price_max: number | null;
  agent_id: string | null;
  agent_name: string | null;
  tags: string[];
}

export interface ClientOffer {
  id: string;
  client_id: string;
  offer_id: string;
  created_at: string;
  user_id: string;
  notes?: string | null;
  status: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  photoURL: string;
  email: string;
  phone?: string;
  location?: string;
  role?: string;
  bio?: string;
  created_at: Date;
  updated_at: Date;
}