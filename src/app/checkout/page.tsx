
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
import { useEffect, useState } from 'react';
import { createShipmentFlow, CreateShipmentOutput } from '@/ai/flows/create-shipment';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(5, 'Address is too short'),
  city: z.string().min(2, 'City is too short'),
  state: z.string().min(2, 'State is required').max(2, 'Use 2-letter state code'),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  cardName: z.string().min(2, 'Name on card is too short'),
  cardNumber: z.string().regex(/^\d{16}$/, 'Invalid card number'),
  expDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid expiration date (MM/YY)'),
  cvc: z.string().regex(/^\d{3,4}$/, 'Invalid CVC'),
  shippingId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [shippingRates, setShippingRates] = useState<CreateShipmentOutput | null>(null);
  const [isFetchingRates, setIsFetchingRates] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      cardName: '',
      cardNumber: '',
      expDate: '',
      cvc: '',
      shippingId: '',
    },
  });

  const watchAddressFields = form.watch(['address', 'city', 'state', 'zip']);

  useEffect(() => {
    const [street, city, state, zip] = watchAddressFields;
    if (street && city && state && zip && form.getFieldState('zip').isDirty) {
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (zipRegex.test(zip)) {
        handleFetchRates();
      }
    }
  }, [watchAddressFields]);
  
  const selectedRate = shippingRates?.rates.find(rate => rate.id === form.watch('shippingId'));
  const shippingCost = selectedRate ? parseFloat(selectedRate.rate) : 0;
  const totalCost = cartTotal + shippingCost;


  const handleFetchRates = async () => {
    setIsFetchingRates(true);
    setShippingRates(null);
    form.setValue('shippingId', '');

    const { address, city, state, zip } = form.getValues();

    try {
        // This is a default 'from' address. In a real application, you'd
        // likely configure this in your store settings.
        const fromAddress = {
            street1: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zip: '90210',
            country: 'US',
        };

        const totalWeightGrams = cartItems.reduce((total, item) => {
            const variant = item.variantId ? item.product.inventory.find(i => i.id === item.variantId) : null;
            const weight = variant?.grams || item.product.inventory[0]?.grams || 100; // default to 100g if not set
            return total + (weight * item.quantity);
        }, 0);
        
        // Convert grams to ounces for EasyPost
        const totalWeightOunces = totalWeightGrams / 28.35;

        // Using a default parcel size for now. A real app might have this
        // per-product or use a box-packing algorithm.
        const parcel = {
            length: 8,
            width: 6,
            height: 4,
            weight: totalWeightOunces,
        }

        const rates = await createShipmentFlow({
            toAddress: { street1: address, city, state, zip, country: 'US' },
            fromAddress,
            parcel
        });

        if (rates && rates.rates.length > 0) {
            setShippingRates(rates);
            form.setValue('shippingId', rates.rates[0].id); // Select first rate by default
        } else {
             toast({ variant: 'destructive', title: 'Shipping Error', description: 'No shipping rates could be found for this address.' });
        }
    } catch (error: any) {
        console.error("Failed to fetch shipping rates", error);
        toast({ variant: 'destructive', title: 'Shipping Error', description: `Could not get shipping rates. ${error.message}` });
    } finally {
        setIsFetchingRates(false);
    }
  }


  function onSubmit(values: FormValues) {
    if (!values.shippingId) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please select a shipping method.'
        });
        return;
    }
    console.log('Checkout successful with values:', { ...values, totalCost });
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
                  <div className="grid grid-cols-[1fr_1fr_100px] gap-4">
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="state" render={({ field }) => (
                      <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} placeholder="CA" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="zip" render={({ field }) => (
                      <FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>
              
               <Card>
                <CardHeader><CardTitle>Shipping Method</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {isFetchingRates ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Fetching rates...</span>
                        </div>
                    ) : shippingRates && shippingRates.rates.length > 0 ? (
                        <FormField
                            control={form.control}
                            name="shippingId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                         <RadioGroup 
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            className="space-y-2"
                                         >
                                            {shippingRates.rates.map(rate => (
                                                <FormItem key={rate.id} className="flex items-center space-x-3 space-y-0 p-4 border rounded-md has-[:checked]:border-primary">
                                                    <FormControl>
                                                        <RadioGroupItem value={rate.id} />
                                                    </FormControl>
                                                    <FormLabel className="font-normal flex-1">
                                                        <div className="flex justify-between">
                                                            <span>{rate.carrier} {rate.service}</span>
                                                            <span className="font-medium">${rate.rate}</span>
                                                        </div>
                                                        {rate.delivery_days && <p className="text-sm text-muted-foreground">Estimated {rate.delivery_days} days</p>}
                                                    </FormLabel>
                                                </FormItem>
                                            ))}
                                         </RadioGroup>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    ) : (
                        <p className="text-muted-foreground text-sm">Enter your address to see shipping options.</p>
                    )}
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

              <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting || isFetchingRates}>
                {form.formState.isSubmitting ? 'Placing Order...' : `Place Order - $${totalCost.toFixed(2)}`}
              </Button>
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
                    <Image src={item.image || ''} alt={item.product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    {item.variantLabel && <p className="text-sm text-muted-foreground">{item.variantLabel}</p>}
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <Separator />
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>{selectedRate ? `$${shippingCost.toFixed(2)}` : 'Calculated at next step'}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>${totalCost.toFixed(2)}</span>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
