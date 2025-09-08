
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
import { ArrowLeft, PlusCircle, Trash2, X, GripVertical, Upload, Image as ImageIcon, Loader2, ChevronDown } from 'lucide-react';
import { addProduct, getCollections, uploadImageAndGetURL } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState, useMemo, useRef } from 'react';
import type { Collection, VariantOption } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const variantOptionSchema = z.object({
  value: z.string().min(1, 'Value cannot be empty.'),
  image: z.string().optional(),
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
  images: z.array(z.string()).optional(),
  variants: z.array(variantSchema).optional(),
  inventory: z.array(inventoryItemSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    async function fetchCollections() {
      try {
        const fetchedCollections = await getCollections();
        setCollections(fetchedCollections);
      } catch (error) {
        console.error("Failed to fetch collections", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not load collections.',
        });
      } finally {
        setIsLoadingCollections(false);
      }
    }
    fetchCollections();
  }, [toast]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      longDescription: '',
      price: 0,
      category: '',
      images: [],
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
  }, [generatedCombinations, basePrice, replaceInventory]);

  const handleAddOption = (variantIndex: number) => {
    const optionValue = newOptions[variantIndex]?.trim();
    if (optionValue) {
      const currentOptions = form.getValues(`variants.${variantIndex}.options`) || [];
      if (currentOptions.some(o => o.value.toLowerCase() === optionValue.toLowerCase())) {
        toast({ variant: 'destructive', title: 'Duplicate Option', description: 'This option value already exists for this variant.' });
        return;
      }
      const newOptionValues = [...currentOptions, { value: optionValue, image: '' }];
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

  const processAndUploadImage = async (file: File) => {
    setIsUploading(true);
    try {
        const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
        });
        
        const uploadedUrl = await uploadImageAndGetURL(dataUrl, 'products');

        const currentImages = form.getValues('images') || [];
        const newImages = [...currentImages, uploadedUrl];

        setImagePreviews(newImages);
        form.setValue('images', newImages, { shouldDirty: true });

    } catch (error) {
        console.error("Image upload failed:", error);
        toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload the image." });
    } finally {
        setIsUploading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processAndUploadImage(file);
      event.target.value = '';
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

  const primaryVariantOptions = useMemo(() => {
    return watchedVariants?.[0]?.options || [];
  }, [watchedVariants]);

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
                                    <FormLabel>Collection</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCollections}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a collection" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        {collections.map((collection) => (
                                            <SelectItem key={collection.id} value={collection.name}>
                                            {collection.name}
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
                                Add variant
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
                                            <FormLabel>Option name</FormLabel>
                                            <FormControl>
                                            <Input placeholder="e.g., Size, Color" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />

                                    <FormItem>
                                        <FormLabel>Option values</FormLabel>
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

                    {primaryVariantOptions.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Inventory</CardTitle>
                                <CardDescription>
                                    Manage price and stock for each variant combination.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {primaryVariantOptions.map((primaryOption, pIndex) => (
                                    <Collapsible key={pIndex} className="border-b last:border-b-0">
                                        <CollapsibleTrigger asChild>
                                            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                                                <div className="flex items-center gap-4">
                                                    <Image src={primaryOption.image || imagePreviews[0] || 'https://placehold.co/64x64'} alt={primaryOption.value} width={40} height={40} className="rounded-md object-cover" />
                                                    <div>
                                                        <p className="font-medium">{primaryOption.value}</p>
                                                        <p className="text-sm text-muted-foreground">{watchedVariants[1]?.options.length || 0} variants</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                     <span className="text-sm w-32 text-right">$... - $...</span>
                                                     <span className="text-sm w-20 text-right">... available</span>
                                                     <Button variant="ghost" size="icon" className="h-8 w-8 data-[state=open]:rotate-180">
                                                        <ChevronDown className="h-4 w-4" />
                                                     </Button>
                                                </div>
                                            </div>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <Table className="bg-muted/20">
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Variant</TableHead>
                                                        <TableHead className="w-[150px]">Price</TableHead>
                                                        <TableHead className="w-[100px]">Available</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                   {(watchedVariants[1]?.options || []).map((secondaryOption, sIndex) => {
                                                        const comboId = `${primaryOption.value}-${secondaryOption.value}`;
                                                        const inventoryItemIndex = inventoryFields.findIndex(i => i.id === comboId);
                                                        
                                                        if (inventoryItemIndex === -1) return null;

                                                        return (
                                                            <TableRow key={comboId}>
                                                                <TableCell>{secondaryOption.value}</TableCell>
                                                                <TableCell>
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`inventory.${inventoryItemIndex}.price`}
                                                                        render={({ field }) => (
                                                                            <FormItem><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                                                        )}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                     <FormField
                                                                        control={form.control}
                                                                        name={`inventory.${inventoryItemIndex}.stock`}
                                                                        render={({ field }) => (
                                                                            <FormItem><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                                                        )}
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                   })}
                                                </TableBody>
                                            </Table>
                                        </CollapsibleContent>
                                    </Collapsible>
                                ))}
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
                                    name="images"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">Product Images</FormLabel>
                                            <FormControl>
                                                <div>
                                                    <input
                                                        type="file"
                                                        ref={imageInputRef}
                                                        onChange={handleImageChange}
                                                        className="hidden"
                                                        accept="image/*"
                                                        multiple={false}
                                                    />
                                                    <div 
                                                        className="aspect-square w-full rounded-md border-2 border-dashed border-muted-foreground/40 flex items-center justify-center text-center cursor-pointer"
                                                        onClick={() => imageInputRef.current?.click()}
                                                    >
                                                        {isUploading ? (
                                                            <div className="text-center text-muted-foreground">
                                                                <Loader2 className="mx-auto h-12 w-12 animate-spin" />
                                                                <p className="mt-2">Uploading...</p>
                                                            </div>
                                                        ) : imagePreviews[0] ? (
                                                            <Image src={imagePreviews[0]} alt="Product preview" width={400} height={400} className="object-cover rounded-md" />
                                                        ) : (
                                                            <div className="text-center text-muted-foreground">
                                                                <Upload className="mx-auto h-12 w-12" />
                                                                <p className="mt-2">Drag and drop or</p>
                                                                <Button variant="link" type="button" className="p-0 h-auto">click to upload</Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <div className="grid grid-cols-4 gap-2">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="relative aspect-square bg-muted rounded-md flex items-center justify-center">
                                            {imagePreviews[i] ? (
                                                <Image src={imagePreviews[i]} alt={`Product preview ${i + 1}`} fill className="object-cover rounded-md" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                            )}
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
                <Button type="submit" disabled={form.formState.isSubmitting || isUploading}>
                {form.formState.isSubmitting ? 'Creating...' : 'Create Product'}
                </Button>
            </div>
        </form>
      </Form>
    </div>
  );
}
