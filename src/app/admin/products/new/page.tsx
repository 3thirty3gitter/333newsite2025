'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useFormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, PlusCircle, Trash2, X, GripVertical, Upload, Image as ImageIcon } from 'lucide-react';
import { addProduct, getCategories } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import type { Category } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const variantOptionSchema = z.object({
  value: z.string().min(1, 'Value cannot be empty.'),
});

const variantSchema = z.object({
    type: z.string().min(1, 'Type cannot be empty.'),
    options: z.array(variantOptionSchema).min(1, 'At least one option is required.'),
});

const inventoryItemSchema = z.object({
    id: z.string(),
    price: z.coerce.number().min(0, "Price can't be negative"),
    stock: z.coerce.number().min(0, "Stock can't be negative"),
});

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  longDescription: z.string().min(20, 'Long description must be at least 20 characters'),
  price: z.coerce.number().min(0.01, 'Price must be a positive number'),
  category: z.string().min(1, 'Category is required'),
  image: z.string().optional(),
  variants: z.array(variantSchema).optional(),
  inventory: z.array(inventoryItemSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      longDescription: '',
      price: 0,
      category: '',
      image: '',
      variants: [],
      inventory: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "variants",
  });
  
  const { fields: inventoryFields, replace: replaceInventory } = useFieldArray({
    control: form.control,
    name: "inventory",
  });

  const [newOptions, setNewOptions] = useState<string[]>([]);
  
  const watchedVariants = form.watch('variants');
  const basePrice = form.watch('price');

  const generatedCombinations = useMemo(() => {
    const validVariants = watchedVariants?.filter(v => v.type && v.options && v.options.length > 0);
    if (!validVariants || validVariants.length === 0) {
        return [];
    }

    const optionGroups = validVariants.map(v => v.options.map(o => o.value));
    const cartesian = <T,>(...a: T[][]): T[][] => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));
    
    return cartesian(...optionGroups);
  }, [watchedVariants]);

  useEffect(() => {
    const newInventory = generatedCombinations.map(combo => {
        const comboId = Array.isArray(combo) ? combo.join('-') : combo;
        const existingItem = inventoryFields.find(item => item.id === comboId);
        return {
            id: comboId,
            price: existingItem?.price ?? basePrice ?? 0,
            stock: existingItem?.stock ?? 0,
        };
    });
    replaceInventory(newInventory);
  }, [generatedCombinations, basePrice, replaceInventory, inventoryFields]);

  const handleAddOption = (variantIndex: number) => {
    const optionValue = newOptions[variantIndex]?.trim();
    if (optionValue) {
      const currentOptions = form.getValues(`variants.${variantIndex}.options`) || [];
      if (currentOptions.some(o => o.value.toLowerCase() === optionValue.toLowerCase())) {
        toast({ variant: 'destructive', title: 'Duplicate Option', description: 'This option value already exists for this variant.' });
        return;
      }
      const newOptionValues = [...currentOptions, { value: optionValue }];
      update(variantIndex, { ...form.getValues(`variants.${variantIndex}`), options: newOptionValues });
      
      const updatedNewOptions = [...newOptions];
      updatedNewOptions[variantIndex] = '';
      setNewOptions(updatedNewOptions);
    }
  };

  const handleRemoveOption = (variantIndex: number, optionIndex: number) => {
    const currentOptions = form.getValues(`variants.${variantIndex}.options`);
    if (currentOptions) {
        const newOptions = currentOptions.filter((_, i) => i !== optionIndex);
        update(variantIndex, { ...form.getValues(`variants.${variantIndex}`), options: newOptions });
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue('image', result);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: FormValues) {
    try {
      await addProduct(values);
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" asChild>
                <Link href="/admin/products">
                    <ArrowLeft />
                    <span className="sr-only">Back to Products</span>
                </Link>
                </Button>
                <h1 className="text-3xl font-headline font-bold">Add New Product</h1>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
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
                                <FormLabel>Base Price</FormLabel>
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
                                    Add options like size or color.
                                </CardDescription>
                            </div>
                            <Button type="button" variant="outline" onClick={() => append({ type: '', options: [] })}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Variant Type
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
                                                placeholder="Add an option (e.g., Red)"
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

                    {inventoryFields.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Inventory</CardTitle>
                                <CardDescription>
                                    Manage price and stock for each variant combination.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Variant</TableHead>
                                            <TableHead className="w-[150px]">Price</TableHead>
                                            <TableHead className="w-[100px]">Stock</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {inventoryFields.map((field, index) => (
                                            <TableRow key={field.id}>
                                                <TableCell className="font-medium">{field.id.split('-').join(' / ')}</TableCell>
                                                <TableCell>
                                                    <FormField
                                                        control={form.control}
                                                        name={`inventory.${index}.price`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input type="number" step="0.01" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <FormField
                                                        control={form.control}
                                                        name={`inventory.${index}.stock`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input type="number" step="1" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </div>
                <div className="md:col-span-1 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product Images</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="image"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">Product Image</FormLabel>
                                            <FormControl>
                                                <>
                                                    <input
                                                        type="file"
                                                        ref={imageInputRef}
                                                        onChange={handleImageChange}
                                                        className="hidden"
                                                        accept="image/*"
                                                    />
                                                    <div 
                                                        className="aspect-square w-full rounded-md border-2 border-dashed border-muted-foreground/40 flex items-center justify-center text-center cursor-pointer"
                                                        onClick={() => imageInputRef.current?.click()}
                                                    >
                                                        {imagePreview ? (
                                                            <Image src={imagePreview} alt="Product preview" fill className="object-cover rounded-md" />
                                                        ) : (
                                                            <div className="text-center text-muted-foreground">
                                                                <ImageIcon className="mx-auto h-12 w-12" />
                                                                <p className="mt-2">Drag and drop or</p>
                                                                <Button variant="link" type="button" className="p-0 h-auto">click to upload</Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <div className="grid grid-cols-4 gap-2">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="aspect-square bg-muted rounded-md flex items-center justify-center">
                                            <Upload className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
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

    