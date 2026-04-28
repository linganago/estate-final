import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBqbL2dKVNDH3rWFo42tiPRURJZDKGJ6A8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mern-estate-aff00.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mern-estate-aff00',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mern-estate-aff00.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '318830777936',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:318830777936:web:6f916386f0836cb36a6355',
};

export const app = initializeApp(firebaseConfig);