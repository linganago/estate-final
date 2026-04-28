import { initializeApp } from 'firebase/app';

const envFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const fallbackFirebaseConfig = {
  apiKey: 'replace-me',
  authDomain: 'mern-estate-5f575.firebaseapp.com',
  projectId: 'mern-estate-5f575',
  storageBucket: 'mern-estate-5f575.firebasestorage.app',
  messagingSenderId: '221547942417',
  appId: '1:221547942417:web:6f81dd696d5280330417b0',
};

const providedEnvKeys = Object.entries(envFirebaseConfig)
  .filter(([, value]) => Boolean(value))
  .map(([key]) => key);
const totalFirebaseConfigKeys = Object.keys(envFirebaseConfig).length;

if (providedEnvKeys.length > 0 && providedEnvKeys.length < totalFirebaseConfigKeys) {
  console.warn(
    'Partial Firebase config detected. Use all Firebase web app values from the same project to avoid Google auth errors.'
  );
}

const firebaseConfig =
  providedEnvKeys.length === totalFirebaseConfigKeys
    ? envFirebaseConfig
    : {
        ...fallbackFirebaseConfig,
        apiKey: envFirebaseConfig.apiKey,
      };

export const app = initializeApp(firebaseConfig);
