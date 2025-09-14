
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, PlusCircle, Trash2, X, GripVertical, Upload, Image as ImageIcon, Loader2, Sparkles, MinusCircle, Link as LinkIcon } from 'lucide-react';
import { addProduct, getCollections, uploadImageAndGetURL } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState, useMemo, useRef } from 'react';
import type { Collection, Variant, VariantOption } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { generateProductDetails } from '@/ai/flows/generate-product-details';
import { scrapeProductUrl } from '@/ai/flows/scrape-product-url';

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
    sku: z.string().optional(),
    barcode: z.string().optional(),
    grams: z.coerce.number().optional(),
});

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  handle: z.string().min(2, 'Handle is required'),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  price: z.coerce.number().min(0.01, 'Price must be a positive number'),
  category: z.string().min(1, 'Category is required'),
  vendor: z.string().optional(),
  tags: z.string().optional(),
  images: z.array(z.string()).optional(),
  variants: z.array(variantSchema).optional(),
  inventory: z.array(inventoryItemSchema).optional(),
  status: z.enum(['active', 'draft']),
  compareAtPrice: z.coerce.number().optional(),
  costPerItem: z.coerce.number().optional(),
  isTaxable: z.boolean(),
  trackQuantity: z.boolean(),
  allowOutOfStockPurchase: z.boolean(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoadingCollections, setIsLoadingCollections] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

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
      handle: '',
      description: '',
      longDescription: '',
      price: 0,
      category: '',
      vendor: '',
      tags: '',
      images: [],
      variants: [],
      inventory: [],
      status: 'active',
      isTaxable: true,
      trackQuantity: true,
      allowOutOfStockPurchase: false,
      seoTitle: '',
      seoDescription: '',
      compareAtPrice: undefined,
      costPerItem: undefined,
    },
  });
  
  const imagePreviews = form.watch('images') || [];

  const productName = form.watch('name');
  useEffect(() => {
    if (productName) {
        const newHandle = productName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
        form.setValue('handle', newHandle, { shouldValidate: true });
    }
  }, [productName, form]);

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
            sku: existingItem?.sku || '',
            barcode: existingItem?.barcode || '',
            grams: existingItem?.grams || 0,
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
    const currentOptions = form.getValues(`variants.${index}.options`);
    if (currentOptions) {
        const newOptions = currentOptions.filter((_, i) => i !== optionIndex);
        update(variantIndex, { ...form.getValues(`variants.${variantIndex}`), options: newOptions });
    }
  };
  
  const processAndUploadImages = async (files: FileList) => {
    setIsUploading(true);
    const currentProductName = form.getValues('name');
    if (!currentProductName) {
      toast({ variant: 'destructive', title: 'Product name required', description: 'Please provide a product name before uploading images.'});
      setIsUploading(false);
      return;
    }

    try {
      const uploadPromises = Array.from(files).map(file => {
        return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
        }).then(dataUrl => uploadImageAndGetURL(dataUrl, 'products', `${currentProductName}-${file.name}`));
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      const currentImages = form.getValues('images') || [];
      const newImages = [...currentImages, ...uploadedUrls];
      form.setValue('images', newImages, { shouldDirty: true });

    } catch (error) {
        console.error("Image upload failed:", error);
        toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload one or more images." });
    } finally {
        setIsUploading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processAndUploadImages(files);
      event.target.value = '';
    }
  };
  
  const handleRemoveImage = (index: number) => {
      const currentImages = form.getValues('images') || [];
      const newImages = currentImages.filter((_, i) => i !== index);
      form.setValue('images', newImages, { shouldDirty: true });
  }

  const handleImageDrop = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    
    const currentImages = [...imagePreviews];
    const draggedItemContent = currentImages.splice(dragItem.current, 1)[0];
    currentImages.splice(dragOverItem.current, 0, draggedItemContent);

    dragItem.current = null;
    dragOverItem.current = null;
    form.setValue('images', currentImages, { shouldDirty: true });
  };


  const handleGenerateDetails = async () => {
    const productName = form.getValues('name');
    if (!productName) {
      toast({
        variant: 'destructive',
        title: 'Product Name Required',
        description: 'Please enter a product name first.',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateProductDetails({ productName });
      form.setValue('description', result.description, { shouldDirty: true });
      form.setValue('longDescription', result.longDescription, { shouldDirty: true });
      form.setValue('seoTitle', result.seoTitle, { shouldDirty: true });
      form.setValue('seoDescription', result.seoDescription, { shouldDirty: true });
      toast({
        title: 'Content Generated',
        description: 'AI has generated new content for product fields.',
      });
    } catch (error) {
      console.error('Failed to generate product details:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate content. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleScrapeUrl = async () => {
    if (!scrapeUrl) {
      toast({ variant: 'destructive', title: 'URL required', description: 'Please enter a URL to scrape.' });
      return;
    }
    setIsScraping(true);
    try {
      const result = await scrapeProductUrl({ url: scrapeUrl });

      form.setValue('name', result.name ?? '', { shouldDirty: true });
      form.setValue('description', result.description ?? result.longDescription ?? '', { shouldDirty: true });
      form.setValue('longDescription', result.longDescription ?? result.description ?? '', { shouldDirty: true });

      if (Array.isArray(result.variants)) {
        form.setValue('variants', result.variants as any[], { shouldDirty: true });
      }
      
      if (Array.isArray(result.images)) {
        form.setValue('images', result.images, { shouldDirty: true });
      }

      toast({
        title: 'Content Imported',
        description: 'Product data has been imported from the URL.',
      });

    } catch (error: any) {
      console.error('Failed to scrape URL:', error);
      toast({
        variant: 'destructive',
        title: 'Scraping Failed',
        description: error.message || 'Could not import data from the URL. Please check the console.',
        duration: 7000
      });
    } finally {
      setIsScraping(false);
    }
  };


  async function onSubmit(values: FormValues) {
    try {
      const productData = {
        ...values,
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : [],
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

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Import from URL</CardTitle>
                    <CardDescription>Paste a link to a supplier's product page to automatically fill in the details below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex w-full items-center space-x-2">
                        <div className="relative flex-grow">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                type="url"
                                placeholder="https://supplier.com/product/example-item"
                                className="pl-10"
                                value={scrapeUrl}
                                onChange={(e) => setScrapeUrl(e.target.value)}
                            />
                        </div>
                        <Button type="button" onClick={handleScrapeUrl} disabled={isScraping}>
                           {isScraping && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                           {isScraping ? 'Importing...' : 'Import'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

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
                                <div className="flex items-center justify-between">
                                    <FormLabel>Short Description</FormLabel>
                                    <Button type="button" variant="outline" size="sm" onClick={handleGenerateDetails} disabled={isGenerating}>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        {isGenerating ? 'Generating...' : 'Generate with AI'}
                                    </Button>
                                </div>
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
                                <div className="flex items-center justify-between">
                                    <FormLabel>Full Description</FormLabel>
                                </div>
                                <FormControl>
                                <Textarea placeholder="Describe the product in detail." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="handle"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>URL Handle</FormLabel>
                                <FormControl>
                                <Input placeholder="e.g., astro-grip-sneakers" {...field} />
                                </FormControl>
                                <FormDescription>This will be the product's URL slug.</FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle>Pricing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
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
                                    name="compareAtPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Compare-at price</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" placeholder="e.g., 159.99" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="isTaxable"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Charge tax on this product</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="costPerItem"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cost per item</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="e.g., 50.00" {...field} />
                                        </FormControl>
                                        <FormDescription>Customers won’t see this.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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

                    {generatedCombinations.length > 0 && (
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
                                            {watchedVariants.map(v => v.type && <TableHead key={v.type}>{v.type}</TableHead>)}
                                            <TableHead className="w-[150px]">Price</TableHead>
                                            <TableHead className="w-[100px]">Available</TableHead>
                                            <TableHead className="w-[150px]">SKU</TableHead>
                                            <TableHead className="w-[100px]">Weight (g)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {generatedCombinations.map((combo, comboIndex) => {
                                            const comboArray = Array.isArray(combo) ? combo : [combo];
                                            return (
                                                <TableRow key={comboIndex}>
                                                    {comboArray.map((option, optionIndex) => <TableCell key={optionIndex}>{option}</TableCell>)}
                                                    <TableCell>
                                                        <FormField
                                                            control={form.control}
                                                            name={`inventory.${comboIndex}.price`}
                                                            render={({ field }) => (
                                                                <FormItem><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                                                            )}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <FormField
                                                            control={form.control}
                                                            name={`inventory.${comboIndex}.stock`}
                                                            render={({ field }) => (
                                                                <FormItem><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                                            )}
                                                        />
                                                    </TableCell>
                                                     <TableCell>
                                                        <FormField
                                                            control={form.control}
                                                            name={`inventory.${comboIndex}.sku`}
                                                            render={({ field }) => (
                                                                <FormItem><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                            )}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <FormField
                                                            control={form.control}
                                                            name={`inventory.${comboIndex}.grams`}
                                                            render={({ field }) => (
                                                                <FormItem><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                                            )}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Search engine listing preview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="seoTitle"
                                render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel>SEO Title</FormLabel>
                                         <Button type="button" variant="outline" size="sm" onClick={handleGenerateDetails} disabled={isGenerating}>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            {isGenerating ? 'Generating...' : 'Generate with AI'}
                                        </Button>
                                    </div>
                                    <FormControl>
                                    <Input placeholder="e.g., The Best Astro-Grip Sneakers" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="seoDescription"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>SEO Description</FormLabel>
                                    <FormControl>
                                    <Textarea placeholder="A great description for search engines." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-1 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>Product status</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a status" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Product organization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
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
                             <FormField
                                control={form.control}
                                name="vendor"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vendor</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., Nike, Adidas" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tags</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., shoes, running, summer" {...field} />
                                    </FormControl>
                                    <FormDescription>Separate tags with a comma.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Product Images</CardTitle>
                            <CardDescription>Drag and drop to reorder images. The first image is the primary one.</CardDescription>
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
                                                        multiple
                                                    />
                                                    <div 
                                                        className="aspect-video w-full rounded-md border-2 border-dashed border-muted-foreground/40 flex items-center justify-center text-center cursor-pointer"
                                                        onClick={() => imageInputRef.current?.click()}
                                                    >
                                                         {isUploading ? (
                                                            <div className="text-center text-muted-foreground">
                                                                <Loader2 className="mx-auto h-12 w-12 animate-spin" />
                                                                <p className="mt-2">Uploading...</p>
                                                            </div>
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
                                
                                {imagePreviews.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                        {imagePreviews.map((imgSrc, i) => (
                                            <div 
                                                key={i} 
                                                className="relative aspect-square cursor-grab"
                                                draggable
                                                onDragStart={() => dragItem.current = i}
                                                onDragEnter={() => dragOverItem.current = i}
                                                onDragEnd={handleImageDrop}
                                                onDragOver={(e) => e.preventDefault()}
                                            >
                                                <Image src={imgSrc} alt={`Product preview ${i + 1}`} fill className="object-cover rounded-md" />
                                                 {i === 0 && (
                                                    <Badge variant="secondary" className="absolute top-1 left-1">Primary</Badge>
                                                 )}
                                                 <Button 
                                                    type="button" 
                                                    variant="destructive" 
                                                    size="icon" 
                                                    className="absolute top-1 right-1 h-6 w-6 opacity-80 hover:opacity-100"
                                                    onClick={() => handleRemoveImage(i)}
                                                >
                                                    <MinusCircle className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting || isUploading || isGenerating || isScraping}>
                {form.formState.isSubmitting ? 'Creating...' : 'Create Product'}
                </Button>
            </div>
        </form>
      </Form>
    </div>
  );
}
