export type Palette = {
  name: string;
  primary: string;
  accent: string;
  bg: string;
  hsl: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
  };
};

export const palettes: Palette[] = [
    { 
      name: 'Default', primary: '#3F51B5', accent: '#FF9800', bg: '#E8EAF6',
      hsl: {
        background: "230 67% 94.1%",
        foreground: "222.2 84% 4.9%",
        card: "230 60% 98%",
        cardForeground: "222.2 84% 4.9%",
        popover: "230 60% 98%",
        popoverForeground: "222.2 84% 4.9%",
        primary: "231.4 48.3% 47.8%",
        primaryForeground: "210 40% 98%",
        secondary: "220 13% 91%",
        secondaryForeground: "222.2 47.4% 11.2%",
        muted: "220 13% 91%",
        mutedForeground: "215.4 16.3% 46.9%",
        accent: "36 100% 50%",
        accentForeground: "210 40% 98%",
        destructive: "0 84.2% 60.2%",
        destructiveForeground: "210 40% 98%",
        border: "220 13% 85%",
        input: "220 13% 88%",
        ring: "231.4 48.3% 47.8%",
      }
    },
    { 
      name: 'Forest', primary: '#2E7D32', accent: '#FFC107', bg: '#E8F5E9',
      hsl: {
        background: "120 60% 96.1%",
        foreground: "124 51% 10%",
        card: "120 50% 99%",
        cardForeground: "124 51% 10%",
        popover: "120 50% 99%",
        popoverForeground: "124 51% 10%",
        primary: "123 48% 34%",
        primaryForeground: "120 40% 98%",
        secondary: "110 23% 92%",
        secondaryForeground: "124 30% 21.2%",
        muted: "110 23% 92%",
        mutedForeground: "125 10% 46.9%",
        accent: "45 100% 51%",
        accentForeground: "45 40% 98%",
        destructive: "0 84.2% 60.2%",
        destructiveForeground: "210 40% 98%",
        border: "110 23% 87%",
        input: "110 23% 90%",
        ring: "123 48% 34%",
      }
    },
    { 
      name: 'Royal', primary: '#6A1B9A', accent: '#EC407A', bg: '#F3E5F5',
      hsl: {
        background: "288 56% 95.1%",
        foreground: "285 64% 14.9%",
        card: "288 50% 98%",
        cardForeground: "285 64% 14.9%",
        popover: "288 50% 98%",
        popoverForeground: "285 64% 14.9%",
        primary: "283 69% 36%",
        primaryForeground: "280 40% 98%",
        secondary: "280 23% 92%",
        secondaryForeground: "282 30% 21.2%",
        muted: "280 23% 92%",
        mutedForeground: "285 10% 46.9%",
        accent: "341 83% 62%",
        accentForeground: "340 40% 98%",
        destructive: "0 84.2% 60.2%",
        destructiveForeground: "210 40% 98%",
        border: "280 23% 87%",
        input: "280 23% 90%",
        ring: "283 69% 36%",
      }
    },
    { 
      name: 'Mono', primary: '#212121', accent: '#757575', bg: '#F5F5F5',
      hsl: {
        background: "0 0% 96.1%",
        foreground: "0 0% 9%",
        card: "0 0% 98%",
        cardForeground: "0 0% 9%",
        popover: "0 0% 98%",
        popoverForeground: "0 0% 9%",
        primary: "0 0% 13%",
        primaryForeground: "0 0% 98%",
        secondary: "0 0% 90%",
        secondaryForeground: "0 0% 20%",
        muted: "0 0% 90%",
        mutedForeground: "0 0% 45%",
        accent: "0 0% 46%",
        accentForeground: "0 0% 98%",
        destructive: "0 84.2% 60.2%",
        destructiveForeground: "0 0% 98%",
        border: "0 0% 85%",
        input: "0 0% 88%",
        ring: "0 0% 13%",
      }
    },
];

export const fontMap: Record<string, {name: string; family: string; css: string;}> = {
    'poppins': { name: 'Poppins', family: 'Poppins', css: '"Poppins", sans-serif'},
    'inter': { name: 'Inter', family: 'Inter', css: '"Inter", sans-serif'},
    'lato': { name: 'Lato', family: 'Lato', css: '"Lato", sans-serif'},
    'roboto': { name: 'Roboto', family: 'Roboto', css: '"Roboto", sans-serif'},
    'pt-sans': { name: 'PT Sans', family: 'PT Sans', css: '"PT Sans", sans-serif'},
    'open-sans': { name: 'Open Sans', family: 'Open Sans', css: '"Open Sans", sans-serif'},
    'source-sans': { name: 'Source Sans 3', family: 'Source Sans 3', css: '"Source Sans 3", sans-serif'},
};
