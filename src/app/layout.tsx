
import type { Metadata } from 'next';
import './globals.css';
import { getThemeSettings } from '@/lib/settings';
import { fontMap, palettes, Palette } from '@/lib/theme';
import { ClientProviders } from '@/components/layout/ClientProviders';

export const metadata: Metadata = {
  title: 'CommerceCraft',
  description: 'Your scalable e-commerce solution.',
};

function generateCssVariables(palette: Palette): string {
  return `
    :root {
      --background: ${palette.hsl.background};
      --foreground: ${palette.hsl.foreground};
      --card: ${palette.hsl.card};
      --card-foreground: ${palette.hsl.cardForeground};
      --popover: ${palette.hsl.popover};
      --popover-foreground: ${palette.hsl.popoverForeground};
      --primary: ${palette.hsl.primary};
      --primary-foreground: ${palette.hsl.primaryForeground};
      --secondary: ${palette.hsl.secondary};
      --secondary-foreground: ${palette.hsl.secondaryForeground};
      --muted: ${palette.hsl.muted};
      --muted-foreground: ${palette.hsl.mutedForeground};
      --accent: ${palette.hsl.accent};
      --accent-foreground: ${palette.hsl.accentForeground};
      --destructive: ${palette.hsl.destructive};
      --destructive-foreground: ${palette.hsl.destructiveForeground};
      --border: ${palette.hsl.border};
      --input: ${palette.hsl.input};
      --ring: ${palette.hsl.ring};
      --radius: 0.5rem;
    }
  `.replace(/\s\s+/g, ' ');
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getThemeSettings();
  const selectedPalette = palettes.find(p => p.name.toLowerCase() === settings.palette) || palettes[0];
  const headlineFont = fontMap[settings.headlineFont] || fontMap['poppins'];
  const bodyFont = fontMap[settings.bodyFont] || fontMap['pt-sans'];
  
  const cssVars = generateCssVariables(selectedPalette);

  return (
    <html lang="en" className="h-full" style={{
        '--font-headline': headlineFont.css,
        '--font-body': bodyFont.css,
      } as React.CSSProperties}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: cssVars }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={`https://fonts.googleapis.com/css2?family=${headlineFont.family.replace(/ /g, '+')}:wght@400;600;700&family=${bodyFont.family.replace(/ /g, '+')}:wght@400;700&display=swap`} rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col">
        <ClientProviders settings={settings}>
            {children}
        </ClientProviders>
      </body>
    </html>
  );
}
