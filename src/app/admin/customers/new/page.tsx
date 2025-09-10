
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';
import { addCustomer } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  role: z.enum(['Primary', 'Billing', 'Shipping', 'Other']),
});

const formSchema = z.object({
  clientType: z.enum(['ORGANIZATION', 'INDIVIDUAL']),
  company: z.string().optional(),
  contacts: z.array(contactSchema).min(1, 'At least one contact is required.'),
  billingStreet: z.string().min(2, 'Street is required'),
  billingCity: z.string().min(2, 'City is required'),
  billingState: z.string().min(2, 'State is required'),
  billingZip: z.string().min(5, 'ZIP code is required'),
  shippingStreet: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingState: z.string().optional(),
  shippingZip: z.string().optional(),
  taxExempt: z.boolean(),
  taxExemptionNumber: z.string().optional(),
  gstNumber: z.string().optional(),
}).refine(data => data.clientType === 'INDIVIDUAL' || (data.clientType === 'ORGANIZATION' && data.company), {
    message: 'Company name is required for organizations.',
    path: ['company'],
});

type FormValues = z.infer<typeof formSchema>;

export default function NewCustomerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSameAsBilling, setIsSameAsBilling] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientType: 'ORGANIZATION',
      company: '',
      contacts: [{ name: '', email: '', phone: '', role: 'Primary' }],
      billingStreet: '',
      billingCity: '',
      billingState: '',
      billingZip: '',
      shippingStreet: '',
      shippingCity: '',
      shippingState: '',
      shippingZip: '',
      taxExempt: false,
      taxExemptionNumber: '',
      gstNumber: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'contacts',
  });
  
  const clientType = form.watch('clientType');
  const billingAddress = form.watch(['billingStreet', 'billingCity', 'billingState', 'billingZip']);

  useEffect(() => {
    if (isSameAsBilling) {
      form.setValue('shippingStreet', billingAddress[0]);
      form.setValue('shippingCity', billingAddress[1]);
      form.setValue('shippingState', billingAddress[2]);
      form.setValue('shippingZip', billingAddress[3]);
    }
  }, [isSameAsBilling, billingAddress, form]);

  async function onSubmit(values: FormValues) {
    try {
      if (isSameAsBilling) {
        values.shippingStreet = values.billingStreet;
        values.shippingCity = values.billingCity;
        values.shippingState = values.billingState;
        values.shippingZip = values.billingZip;
      }
      await addCustomer(values);
      toast({
        title: 'Customer Created',
        description: `The customer has been successfully created.`,
      });
      router.push('/admin/customers');
      router.refresh();
    } catch (error) {
      console.error('Failed to create customer:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create customer. Please try again.',
      });
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin/customers">
                <ArrowLeft />
                <span className="sr-only">Back to Customers</span>
              </Link>
            </Button>
            <h1 className="text-3xl font-headline font-bold">Add New Customer</h1>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="clientType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a client type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ORGANIZATION">Organization</SelectItem>
                            <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {clientType === 'ORGANIZATION' && (
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Piedmont Corp" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>Add one or more contacts for this customer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                            <h3 className="font-medium">Contact {index + 1}</h3>
                             {fields.length > 1 && (
                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => remove(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name={`contacts.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`contacts.${index}.email`} render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`contacts.${index}.phone`} render={({ field }) => (<FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name={`contacts.${index}.role`} render={({ field }) => (<FormItem><FormLabel>Role</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="Primary">Primary</SelectItem><SelectItem value="Billing">Billing</SelectItem><SelectItem value="Shipping">Shipping</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            </div>
                        </div>
                    ))}
                     <Button type="button" variant="outline" onClick={() => append({ name: '', email: '', phone: '', role: 'Primary' })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Contact
                    </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Address Information</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-medium mb-4">Billing Address</h3>
                        <div className="space-y-4">
                            <FormField control={form.control} name="billingStreet" render={({ field }) => (<FormItem><FormLabel>Street</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="grid grid-cols-3 gap-4">
                                <FormField control={form.control} name="billingCity" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="billingState" render={({ field }) => (<FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="billingZip" render={({ field }) => (<FormItem><FormLabel>ZIP</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                        </div>
                    </div>
                     <Separator />
                     <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium">Shipping Address</h3>
                             <div className="flex items-center space-x-2">
                                <Checkbox id="sameAsBilling" checked={isSameAsBilling} onCheckedChange={() => setIsSameAsBilling(!isSameAsBilling)} />
                                <label htmlFor="sameAsBilling" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Same as billing
                                </label>
                            </div>
                        </div>
                         <div className={cn("space-y-4", isSameAsBilling && "hidden")}>
                            <FormField control={form.control} name="shippingStreet" render={({ field }) => (<FormItem><FormLabel>Street</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="grid grid-cols-3 gap-4">
                                <FormField control={form.control} name="shippingCity" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="shippingState" render={({ field }) => (<FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="shippingZip" render={({ field }) => (<FormItem><FormLabel>ZIP</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                        </div>
                    </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-1">
                <Card>
                    <CardHeader><CardTitle>Tax Information</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="taxExempt"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Tax Exempt</FormLabel>
                                    <FormDescription>This customer is exempt from sales tax.</FormDescription>
                                </div>
                                </FormItem>
                            )}
                        />
                        {form.watch('taxExempt') && (
                             <FormField control={form.control} name="taxExemptionNumber" render={({ field }) => (<FormItem><FormLabel>Tax Exemption #</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        )}
                        <FormField control={form.control} name="gstNumber" render={({ field }) => (<FormItem><FormLabel>GST Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </CardContent>
                </Card>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 mt-8">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Creating...' : 'Create Customer'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
