

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
  sections: [
    {
      id: 'hero-1',
      type: 'hero',
      props: {
        title: 'Welcome to CommerceCraft',
        subtitle: 'Discover a new era of online shopping. Quality products, seamless experience.',
        imageUrl: 'https://picsum.photos/1920/1080',
        buttonLabel: 'Shop Now',
        buttonHref: '#products'
      }
    },
    {
      id: 'featured-products-1',
      type: 'featured-products',
      props: {
        title: 'Featured Products',
        subtitle: 'Check out our latest collection of hand-picked items.',
        count: 8,
      }
    }
  ],
};

export async function getThemeSettings(): Promise<ThemeSettings> {
  try {
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Merge with defaults to ensure all keys are present, especially new ones like sections
      return { 
        ...defaultSettings, 
        ...data,
        // Deep merge for sections if they exist, otherwise use default
        sections: data.sections || defaultSettings.sections
      };
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
