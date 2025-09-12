
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/context/CartProvider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const formSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(5, 'Address is too short'),
  city: z.string().min(2, 'City is too short'),
  zip: z.string().regex(/^\d{5}$/, 'Invalid ZIP code'),
  cardName: z.string().min(2, 'Name on card is too short'),
  cardNumber: z.string().regex(/^\d{16}$/, 'Invalid card number'),
  expDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid expiration date (MM/YY)'),
  cvc: z.string().regex(/^\d{3}$/, 'Invalid CVC'),
});

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      address: '',
      city: '',
      zip: '',
      cardName: '',
      cardNumber: '',
      expDate: '',
      cvc: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log('Checkout successful with values:', values);
    clearCart();
    router.push('/order-confirmation');
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl text-center py-20">
        <h1 className="text-2xl font-bold">Your cart is empty.</h1>
        <p className="text-muted-foreground mt-2">Add items to your cart before proceeding to checkout.</p>
        <Button asChild className="mt-6">
            <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-headline font-bold mb-8 text-center">Checkout</h1>
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-headline font-semibold mb-6">Shipping & Payment</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader><CardTitle>Shipping Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="zip" render={({ field }) => (
                      <FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Payment Details (Simulated)</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="cardName" render={({ field }) => (
                    <FormItem><FormLabel>Name on Card</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="cardNumber" render={({ field }) => (
                    <FormItem><FormLabel>Card Number</FormLabel><FormControl><Input placeholder="1111222233334444" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="expDate" render={({ field }) => (
                      <FormItem><FormLabel>Expiration (MM/YY)</FormLabel><FormControl><Input placeholder="12/25" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="cvc" render={({ field }) => (
                      <FormItem><FormLabel>CVC</FormLabel><FormControl><Input placeholder="123" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" size="lg" className="w-full">Place Order</Button>
            </form>
          </Form>
        </div>
        <div className="row-start-1 lg:row-start-auto">
          <h2 className="text-2xl font-headline font-semibold mb-6">Order Summary</h2>
          <Card>
            <CardContent className="p-6 space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                    <Image src={item.image} alt={item.product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    {item.variantLabel && <p className="text-sm text-muted-foreground">{item.variantLabel}</p>}
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
