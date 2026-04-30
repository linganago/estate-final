import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';

const defaultFirebaseConfig = {
  apiKey: 'AIzaSyBqbL2dKVNDH3rWFo42tiPRURJZDKGJ6A8',
  authDomain: 'mern-estate-aff00.firebaseapp.com',
  projectId: 'mern-estate-aff00',
  storageBucket: 'mern-estate-aff00.firebasestorage.app',
  messagingSenderId: '318830777936',
  appId: '1:318830777936:web:6f916386f0836cb36a6355',
  measurementId: 'G-SHD10N8SMP',
};

const envValue = (key) => {
  const value = import.meta.env[key];
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim().replace(/^['"]|['"]$/g, '');
  if (
    !trimmed ||
    trimmed === 'undefined' ||
    trimmed === 'null' ||
    /^\$[A-Z0-9_]+$/.test(trimmed)
  ) {
    return undefined;
  }

  return trimmed;
};

const authDomainValue = (value) => value?.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

const firebaseConfig = {
  apiKey: envValue('VITE_FIREBASE_API_KEY') || defaultFirebaseConfig.apiKey,
  authDomain:
    authDomainValue(envValue('VITE_FIREBASE_AUTH_DOMAIN')) ||
    defaultFirebaseConfig.authDomain,
  projectId: envValue('VITE_FIREBASE_PROJECT_ID') || defaultFirebaseConfig.projectId,
  storageBucket: envValue('VITE_FIREBASE_STORAGE_BUCKET') || defaultFirebaseConfig.storageBucket,
  messagingSenderId:
    envValue('VITE_FIREBASE_MESSAGING_SENDER_ID') ||
    defaultFirebaseConfig.messagingSenderId,
  appId: envValue('VITE_FIREBASE_APP_ID') || defaultFirebaseConfig.appId,
  measurementId:
    envValue('VITE_FIREBASE_MEASUREMENT_ID') ||
    envValue('VITE_MEASUREMENTID') ||
    defaultFirebaseConfig.measurementId,
};

if (firebaseConfig.authDomain.endsWith('.up.railway.app')) {
  firebaseConfig.authDomain = defaultFirebaseConfig.authDomain;
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.useDeviceLanguage();

export const analyticsPromise =
  typeof window !== 'undefined' && firebaseConfig.measurementId
    ? isSupported()
        .then((supported) => (supported ? getAnalytics(app) : null))
        .catch(() => null)
    : Promise.resolve(null);

export const firebaseAuthDomain = firebaseConfig.authDomain;
