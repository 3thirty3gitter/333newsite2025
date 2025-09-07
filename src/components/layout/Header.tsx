
'use server';

import Link from 'next/link';
import { ShoppingBag, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartIcon } from '../cart/CartIcon';
import { getThemeSettings } from '@/lib/settings';
import Image from 'next/image';

export async function Header() {
  const settings = await getThemeSettings();
  
  const { logoUrl, logoWidth, menuItems } = settings;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          {logoUrl ? (
            <Image src={logoUrl} alt="CommerceCraft Logo" width={logoWidth || 140} height={40} style={{ objectFit: 'contain', width: `${logoWidth || 140}px`, height: '40px' }} />
          ) : (
            <>
                <ShoppingBag className="h-6 w-6 text-primary" />
                <span className="font-bold font-headline inline-block">CommerceCraft</span>
            </>
          )}
        </Link>
        <nav className="hidden md:flex flex-1 items-center gap-6 text-sm">
            {menuItems?.map((item, index) => (
                <Link key={index} href={item.href} className="text-foreground/80 hover:text-foreground transition-colors">
                    {item.label}
                </Link>
            ))}
        </nav>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <Crown className="h-5 w-5" />
              <span className="sr-only">Admin Dashboard</span>
            </Link>
          </Button>
          <CartIcon />
        </div>
      </div>
    </header>
  );
}
