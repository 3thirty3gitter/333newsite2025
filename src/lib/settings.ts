'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { ThemeSettings } from './types';

const settingsDocRef = doc(db, 'config', 'theme');

const defaultSettings: ThemeSettings = {
  palette: 'default',
  headlineFont: 'poppins',
  bodyFont: 'pt-sans',
};

export async function getThemeSettings(): Promise<ThemeSettings> {
  try {
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as ThemeSettings;
    }
    return defaultSettings;
  } catch (error) {
    console.error("Error fetching theme settings, returning defaults:", error);
    return defaultSettings;
  }
}

export async function updateThemeSettings(settings: ThemeSettings): Promise<void> {
  await setDoc(settingsDocRef, settings, { merge: true });
}
