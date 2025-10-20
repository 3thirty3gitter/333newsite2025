
'use server';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { dbAdmin } from './firebase'; // Import dbAdmin for server-side operations
import type { ThemeSettings } from './types';

const settingsDocRef = doc(dbAdmin, 'config', 'theme'); // Use dbAdmin here

const defaultSettings: ThemeSettings = {
  palette: 'default',
  headlineFont: 'poppins',
  bodyFont: 'pt-sans',
  logoUrl: '',
  logoWidth: 140,
  menuItems: [
    { label: 'Home', href: '/' },
    { 
      label: 'Apparel', 
      href: '/apparel',
      megaMenu: [
        {
          title: 'Product Type',
          children: [
            { label: 'T-Shirts', href: '/products/t-shirts', description: 'Comfortable and stylish tees.'},
            { label: 'Hoodies', href: '/products/hoodies', description: 'Stay warm with our hoodies.'},
            { label: 'Hats', href: '/products/hats', description: 'Top off your look.'},
          ]
        },
        {
          title: 'Men',
          children: [
            { label: 'All Men\'s', href: '/collections/men', description: 'Shop the entire collection.'},
            { label: 'New Arrivals', href: '/collections/men-new', description: 'The latest trends.'},
            { label: 'Best Sellers', href: '/collections/men-best', description: 'Our most popular items.'},
          ]
        },
        {
          title: 'Women',
          children: [
            { label: 'All Women\'s', href: '/collections/women', description: 'Shop the entire collection.'},
            { label: 'New Arrivals', href: '/collections/women-new', description: 'The latest trends.'},
            { label: 'Best Sellers', href: '/collections/women-best', description: 'Our most popular items.'},
          ]
        },
        {
          title: 'Youth',
          children: [
            { label: 'All Youth', href: '/collections/youth', description: 'Styles for the next generation.'},
            { label: 'New Arrivals', href: '/collections/youth-new', description: 'Fresh looks for kids.'},
            { label: 'Best Sellers', href: '/collections/youth-best', description: 'Kid-approved favorites.'},
          ]
        },
      ]
    },
    { 
      label: 'DTF Transfers', 
      href: '/dtf-transfers',
      children: [
        { label: 'Gang Sheets', href: '/dtf/gang-sheets', description: 'Customizable gang sheets for your designs.' },
        { label: 'Single Images', href: '/dtf/single-images', description: 'Perfect for individual prints.' },
        { label: 'Transfer Patches', href: '/dtf/patches', description: 'Add a professional touch.' },
      ]
    },
    { label: 'Full Print Services', href: '/full-print-services' },
    { label: 'Labels & Packaging', href: '/labels-packaging' },
    { label: 'Stickers & Decals', href: '/stickers-decals' },
    { label: 'Request a Quote', href: '/request-a-quote' },
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
