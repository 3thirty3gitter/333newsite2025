'use server';

import { initializeApp, getApps, getApp } from 'firebase/app';
import * as fs from 'fs'; // Import Node.js file system module for debugging
import * as admin from 'firebase-admin'; // Keep as `* as admin`
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  "projectId": "commercecraft-g9ur4",
  "appId": "1:1007345228922:web:170fd677fcac965a14afc3",
  "storageBucket": "commercecraft-g9ur4.firebasestorage.app",
  "apiKey": "AIzaSyBRSQDinwQhNtwW3Q91rDQ5K9f64MJ4WNQ",
  "authDomain": "commercecraft-g9ur4.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1007345228922"
};

// Initialize Firebase
let clientApp;
if (!getApps().length) { // Check for client-side apps
  console.log("[Firebase Client Init] Initializing new client Firebase app instance.");
  clientApp = initializeApp(firebaseConfig);
} else {
  console.log("[Firebase Client Init] Using existing client Firebase app instance.");
  clientApp = getApp();
}
const db = getFirestore(clientApp);
const storage = getStorage(clientApp);

let adminApp;
if (!admin.apps.length) { // Check for admin apps using admin.apps array
  console.log("[Firebase Admin Init Debug] GOOGLE_APPLICATION_CREDENTIALS env var:", process.env.GOOGLE_APPLICATION_CREDENTIALS);
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error("[Firebase Admin Init Debug] ERROR: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.");
    // Optionally throw here or return, but let's try to proceed to see if defaultCredential still causes an error
  }

  console.log("[Firebase Admin Init] Attempting to initialize new admin Firebase app instance.");
  let defaultCredential;
  try {
    defaultCredential = admin.credential.applicationDefault();
    if (!defaultCredential) {
      throw new Error("admin.credential.applicationDefault() returned undefined. Ensure GOOGLE_APPLICATION_CREDENTIALS is set.");
    }

    // Attempt to read the file content for debugging
    try {
      const filePath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      const fileContent = fs.readFileSync(filePath, 'utf8');
      console.log("[Firebase Admin Init Debug] Service account file content (first 200 chars):");
      console.log(fileContent.substring(0, 200));
    } catch (fileError) {
      console.error("[Firebase Admin Init Debug] ERROR: Could not read service account key file. Please check path and permissions. Error:", fileError);
    }

    adminApp = admin.initializeApp({
      credential: defaultCredential, // Uses GOOGLE_APPLICATION_CREDENTIALS env var
    });
    console.log("[Firebase Admin Init] Admin Firebase app initialized successfully.");
  } catch (error) {
    console.error("[Firebase Admin Init] FATAL ERROR: Could not initialize Firebase Admin SDK. Please ensure GOOGLE_APPLICATION_CREDENTIALS is correctly set and points to a valid service account key file. Error details:", error);
    throw error; // Re-throw to stop execution, as admin SDK is critical for server components.
  }
} else {
  console.log("[Firebase Admin Init] Using existing admin Firebase app instance.");
  adminApp = admin.getApp();
}
const dbAdmin = admin.firestore(adminApp);
const storageAdmin = admin.storage(adminApp);

export { clientApp as app, db, storage, dbAdmin, storageAdmin };