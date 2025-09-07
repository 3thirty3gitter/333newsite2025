'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, PlusCircle, Trash2, X, GripVertical } from 'lucide-react';
import { addProduct, getCategories } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import type { Category } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const variantOptionSchema = z.object({
  value: z.string().min(1, 'Value cannot be empty.'),
});

const variantSchema = z.object({
    type: z.string().min(1, 'Type cannot be empty.'),
    options: z.array(variantOptionSchema).min(1, 'At least one option is required.'),
});

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  longDescription: z.string().min(20, 'Long description must be at least 20 characters'),
  price: z.coerce.number().min(0.01, 'Price must be a positive number'),
  category: z.string().min(1, 'Category is required'),
  variants: z.array(variantSchema).optional(),
});

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to fetch categories", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not load categories.',
        });
      } finally {
        setIsLoadingCategories(false);
      }
    }
    fetchCategories();
  }, [toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      longDescription: '',
      price: 0,
      category: '',
      variants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const [newOptions, setNewOptions] = useState<string[]>([]);

  const handleAddOption = (variantIndex: number) => {
    const optionValue = newOptions[variantIndex]?.trim();
    if (optionValue) {
      const currentOptions = form.getValues(`variants.${variantIndex}.options`) || [];
      const newOptionValues = [...currentOptions, { value: optionValue }];
      form.setValue(`variants.${variantIndex}.options`, newOptionValues, { shouldValidate: true });
      
      const updatedNewOptions = [...newOptions];
      updatedNewOptions[variantIndex] = '';
      setNewOptions(updatedNewOptions);
    }
  };

  const handleRemoveOption = (variantIndex: number, optionIndex: number) => {
    const currentOptions = form.getValues(`variants.${variantIndex}.options`);
    if (currentOptions) {
        const newOptions = currentOptions.filter((_, i) => i !== optionIndex);
        form.setValue(`variants.${variantIndex}.options`, newOptions, { shouldValidate: true });
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const productData = {
        name: values.name,
        description: values.description,
        longDescription: values.longDescription,
        price: values.price,
        category: values.category,
        variants: values.variants?.map(v => ({
            type: v.type,
            options: v.options.map(o => ({ value: o.value, priceModifier: 0 }))
        })) || []
      };
      await addProduct(productData);
      toast({
        title: 'Product Created',
        description: `The product "${values.name}" has been successfully created.`,
      });
      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      console.error('Failed to create product:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create product. Please try again.',
      });
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/products">
            <ArrowLeft />
            <span className="sr-only">Back to Products</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-headline font-bold">Add New Product</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Astro-Grip Sneakers" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Input placeholder="A brief, catchy description." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="longDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the product in detail." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 129.99" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCategories}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={category.name}>
                                {category.name}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Variants</CardTitle>
                    <CardDescription>
                        Add options like size or color. Products with no variants are considered single-SKU.
                    </CardDescription>
                </div>
                <Button type="button" variant="outline" onClick={() => append({ type: '', options: [] })}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Variant
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                {fields.length > 0 && <Separator />}
                {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[auto_1fr] items-start gap-4">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-9 cursor-grab" />
                    <div className="p-4 border rounded-md space-y-4 relative">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <FormField
                            control={form.control}
                            name={`variants.${index}.type`}
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Variant Type</FormLabel>
                                <FormControl>
                                <Input placeholder="e.g., Size, Color" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />

                        <FormItem>
                            <FormLabel>Options</FormLabel>
                            <div className="flex flex-wrap gap-2">
                                {form.watch(`variants.${index}.options`)?.map((option, optionIndex) => (
                                    <Badge key={optionIndex} variant="secondary" className="flex items-center gap-1.5 pl-3 pr-1.5 py-1 text-sm">
                                        {option.value}
                                        <button type="button" onClick={() => handleRemoveOption(index, optionIndex)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2 mt-2">
                                <Input
                                    placeholder="Add an option (e.g., Red) and press Enter"
                                    value={newOptions[index] || ''}
                                    onChange={(e) => {
                                        const updatedNewOptions = [...newOptions];
                                        updatedNewOptions[index] = e.target.value;
                                        setNewOptions(updatedNewOptions);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddOption(index);
                                        }
                                    }}
                                />
                                <Button type="button" variant="outline" onClick={() => handleAddOption(index)}>Add</Button>
                            </div>
                            <FormMessage>{form.formState.errors.variants?.[index]?.options?.message}</FormMessage>
                        </FormItem>
                    </div>
                </div>
                ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
