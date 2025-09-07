'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartProvider';
import { CartSheet } from './CartSheet';
import { useState } from 'react';

export function CartIcon() {
  const { cartCount } = useCart();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="icon" className="relative" onClick={() => setIsSheetOpen(true)}>
        <ShoppingCart className="h-5 w-5" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
            {cartCount}
          </span>
        )}
        <span className="sr-only">Shopping Cart</span>
      </Button>
      <CartSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  );
}
