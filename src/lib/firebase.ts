import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  "projectId": "commercecraft-g9ur4",
  "appId": "1:1007345228922:web:170fd677fcac965a14afc3",
  "storageBucket": "commercecraft-g9ur4.appspot.com",
  "apiKey": "AIzaSyBRSQDinwQhNtwW3Q91rDQ5K9f64MJ4WNQ",
  "authDomain": "commercecraft-g9ur4.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1007345228922"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
