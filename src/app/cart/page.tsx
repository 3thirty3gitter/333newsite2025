
'use client';

import { useCart } from '@/context/CartProvider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CartItem } from '@/components/cart/CartItem';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
  const { cartItems, cartTotal, cartCount } = useCart();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-headline font-bold mb-8">Your Cart</h1>
      {cartCount > 0 ? (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="flex flex-col divide-y">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-4">
                      <CartItem item={item} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({cartCount} items)</span>
                  <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="text-center p-12">
          <CardHeader>
            <CardTitle className="text-2xl">Your Cart is Empty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Button asChild>
              <Link href="/">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
