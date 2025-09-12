
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
  pages: [
    {
      id: 'home',
      name: 'Home',
      path: '/',
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
            productIds: [],
          }
        },
        {
          id: 'image-with-text-1',
          type: 'image-with-text',
          props: {
            title: 'Crafted for Comfort',
            text: 'Our products are designed with the best materials to ensure they are not only stylish but also comfortable for everyday wear. Experience the difference in quality and craftsmanship.',
            imageUrl: `https://picsum.photos/800/600?random=4`,
            buttonLabel: 'Explore Collections',
            buttonHref: '/products',
            imagePosition: 'left'
          }
        },
        {
          id: 'testimonials-1',
          type: 'testimonials',
          props: {
            title: 'What Our Customers Say',
            subtitle: 'We are trusted by thousands of happy customers. Here is what some of them have to say.',
            testimonials: [
              {
                name: 'Sarah J.',
                title: 'Verified Buyer',
                quote: "I absolutely love my new sneakers! They are stylish, comfortable, and the quality is outstanding. The customer service was also top-notch.",
                avatarUrl: 'https://picsum.photos/100/100?random=1',
              },
              {
                name: 'Mike D.',
                title: 'Tech Enthusiast',
                quote: "The delivery was incredibly fast, and the product exceeded my expectations. I will definitely be a returning customer. Highly recommended!",
                avatarUrl: 'https://picsum.photos/100/100?random=2',
              },
              {
                name: 'Jessica L.',
                title: 'Fashion Blogger',
                quote: "CommerceCraft has an amazing selection. I found the perfect gift for my friend, and she loved it. The checkout process was seamless.",
                avatarUrl: 'https://picsum.photos/100/100?random=3',
              },
            ]
          }
        },
        {
          id: 'faq-1',
          type: 'faq',
          props: {
            title: 'Got Questions?',
            subtitle: 'We have answers! Check out our FAQ section to find what you are looking for.',
            items: [
              {
                question: 'What materials do you use?',
                answer: 'We prioritize sustainable and high-quality materials. Each product page has a detailed breakdown of the materials used.'
              },
              {
                question: 'What sizes do you offer?',
                answer: 'We offer a wide range of sizes from XS to XXXL. Please check our sizing chart for detailed measurements to find your perfect fit.'
              },
              {
                question: 'How do I care for my new items?',
                answer: 'Care instructions are provided on the label of each garment and on the product page. Following these will help your new items last longer.'
              }
            ]
          }
        }
      ]
    }
  ],
  sections: [], // Deprecated
};

export async function getThemeSettings(): Promise<ThemeSettings> {
  try {
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const settings = { ...defaultSettings, ...data };
      
      // Migration: if old `sections` exist and `pages` does not, move them.
      if (data.sections && data.sections.length > 0 && (!data.pages || data.pages.length === 0)) {
        settings.pages = [
          {
            id: 'home',
            name: 'Home',
            path: '/',
            sections: data.sections
          }
        ];
        settings.sections = []; // Clear deprecated field
      } else {
        settings.pages = data.pages || defaultSettings.pages;
      }
      
      return settings;
    }
    return defaultSettings;
  } catch (error) {
    console.error("Error fetching theme settings, returning defaults:", error);
    return defaultSettings;
  }
}

export async function updateThemeSettings(settings: Partial<ThemeSettings>): Promise<void> {
  // Ensure we don't save the deprecated 'sections' field
  if (settings.sections) {
    delete settings.sections;
  }
  await setDoc(settingsDocRef, settings, { merge: true });
}
