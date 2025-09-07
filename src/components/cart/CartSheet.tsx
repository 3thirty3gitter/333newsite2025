'use client';

import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartProvider';
import { CartItem } from './CartItem';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { cartItems, cartTotal, cartCount } = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>Shopping Cart ({cartCount})</SheetTitle>
        </SheetHeader>
        <Separator />
        {cartCount > 0 ? (
          <>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-4 p-6">
                {cartItems.map((item) => (
                  <CartItem key={item.product.id} item={item} />
                ))}
              </div>
            </ScrollArea>
            <Separator />
            <SheetFooter className="p-6">
              <div className="flex w-full flex-col gap-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <p className="text-sm text-muted-foreground">Shipping and taxes calculated at checkout.</p>
                <Button asChild size="lg" className="w-full" onClick={() => onOpenChange(false)}>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button variant="outline" asChild onClick={() => onOpenChange(false)}>
                  <Link href="/cart">View Cart</Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <h3 className="font-semibold">Your cart is empty</h3>
            <p className="text-muted-foreground">Add some products to get started.</p>
            <Button onClick={() => onOpenChange(false)}>Continue Shopping</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
