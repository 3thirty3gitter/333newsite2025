
'use server';

import Link from 'next/link';
import { ShoppingBag, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartIcon } from '../cart/CartIcon';
import { getThemeSettings } from '@/lib/settings';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { MenuItem } from '@/lib/types';

const NavLinks = ({ items }: { items: MenuItem[] }) => (
    <>
        {items.map((item, index) => (
            <Link key={index} href={item.href} className="text-foreground/80 hover:text-foreground transition-colors text-sm">
                {item.label}
            </Link>
        ))}
    </>
);

const Logo = ({ logoUrl, logoWidth }: { logoUrl?: string, logoWidth?: number }) => (
    <Link href="/" className="flex items-center space-x-2">
      {logoUrl ? (
        <Image src={logoUrl} alt="CommerceCraft Logo" width={logoWidth || 140} height={40} style={{ objectFit: 'contain', width: `${logoWidth || 140}px`, height: 'auto' }} />
      ) : (
        <>
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline inline-block">CommerceCraft</span>
        </>
      )}
    </Link>
);

const HeaderActions = () => (
     <div className="flex items-center space-x-2">
      <Button variant="ghost" size="icon" asChild>
        <Link href="/admin">
          <Crown className="h-5 w-5" />
          <span className="sr-only">Admin Dashboard</span>
        </Link>
      </Button>
      <CartIcon />
    </div>
);


export async function Header() {
  const settings = await getThemeSettings();
  const { logoUrl, logoWidth, menuItems = [], headerType } = settings;
  const midPoint = Math.ceil(menuItems.length / 2);
  const firstHalfMenu = menuItems.slice(0, midPoint);
  const secondHalfMenu = menuItems.slice(midPoint);

  const standardLayout = (
    <div className="container flex items-center py-2">
        <div className="mr-6">
            <Logo logoUrl={logoUrl} logoWidth={logoWidth} />
        </div>
        <nav className="hidden md:flex flex-1 items-center gap-6">
           <NavLinks items={menuItems} />
        </nav>
        <HeaderActions />
      </div>
  );

  const centeredLayout = (
    <div className="container relative flex flex-col items-center py-4">
       <div className="mb-4">
          <Logo logoUrl={logoUrl} logoWidth={logoWidth} />
       </div>
        <nav className="flex items-center gap-6">
            <NavLinks items={menuItems} />
        </nav>
        <div className="absolute top-1/2 right-4 -translate-y-1/2">
            <HeaderActions />
        </div>
    </div>
  );

  const splitLayout = (
      <div className="container flex items-center justify-between py-2">
        <nav className="hidden md:flex items-center gap-6">
            <NavLinks items={firstHalfMenu} />
        </nav>
        <Logo logoUrl={logoUrl} logoWidth={logoWidth} />
        <nav className="hidden md:flex items-center gap-6">
            <NavLinks items={secondHalfMenu} />
        </nav>
        <div className="absolute top-1/2 right-4 -translate-y-1/2">
            <HeaderActions />
        </div>
      </div>
  );
  
  const minimalistLayout = (
     <div className="container flex items-center justify-between py-2">
        <div className="mr-6">
            <Logo logoUrl={logoUrl} logoWidth={logoWidth} />
        </div>
        <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
                <NavLinks items={menuItems} />
            </nav>
            <HeaderActions />
        </div>
     </div>
  );

  const logoTopLayout = (
    <div className="container flex flex-col items-center py-4">
        <div className="mb-4">
            <Logo logoUrl={logoUrl} logoWidth={logoWidth} />
        </div>
        <div className="w-full border-t">
            <nav className="flex items-center justify-center gap-6 pt-4">
                 <NavLinks items={menuItems} />
            </nav>
        </div>
        <div className="absolute top-4 right-4">
            <HeaderActions />
        </div>
    </div>
  );
  
  const renderLayout = () => {
      switch (headerType) {
          case 'centered':
              return centeredLayout;
          case 'split':
              return splitLayout;
          case 'minimalist':
              return minimalistLayout;
          case 'logo-top':
              return logoTopLayout;
          case 'standard':
          default:
              return standardLayout;
      }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {renderLayout()}
    </header>
  );
}
