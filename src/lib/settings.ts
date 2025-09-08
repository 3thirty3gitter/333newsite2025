
'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { ThemeSettings } from './types';

const settingsDocRef = doc(db, 'config', 'theme');

const defaultSettings: ThemeSettings = {
  palette: 'default',
  headlineFont: 'poppins',
  bodyFont: 'pt-sans',
  logoUrl: '',
  logoWidth: 140,
  menuItems: [
    { label: 'Home', href: '/' },
    { label: 'All Products', href: '/products' },
  ],
  headerType: 'standard',
};

export async function getThemeSettings(): Promise<ThemeSettings> {
  try {
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
      // Merge with defaults to ensure all keys are present
      return { ...defaultSettings, ...docSnap.data() };
    }
    return defaultSettings;
  } catch (error) {
    console.error("Error fetching theme settings, returning defaults:", error);
    return defaultSettings;
  }
}

export async function updateThemeSettings(settings: Partial<ThemeSettings>): Promise<void> {
  await setDoc(settingsDocRef, settings, { merge: true });
}
