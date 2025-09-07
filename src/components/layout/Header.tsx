'use client';

import Link from 'next/link';
import { ShoppingBag, Crown, Trello } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartIcon } from '../cart/CartIcon';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline inline-block">CommerceCraft</span>
        </Link>
        <nav className="flex-1">
          {/* Main navigation links can go here */}
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
