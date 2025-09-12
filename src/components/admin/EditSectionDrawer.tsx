
'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Collection, PageSection, Product } from '@/lib/types';
import Image from 'next/image';
import { Upload, Loader2, Sparkles, X, Check } from 'lucide-react';
import { HeroSection } from '../sections/HeroSection';
import { FeaturedProductsSection } from '../sections/FeaturedProductsSection';
import { Slider } from '../ui/slider';
import { getCollections, getProducts, uploadImageAndGetURL } from '@/lib/data';
import { CollectionsSection } from '../sections/CollectionsSection';
import { FaqSection } from '../sections/FaqSection';
import { ImageWithTextSection } from '../sections/ImageWithTextSection';
import { TestimonialsSection } from '../sections/TestimonialsSection';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generateHeroText } from '@/ai/flows/generate-hero-text';
import { GenerateImageDialog } from './GenerateImageDialog';
import { SpacerSection } from '../sections/SpacerSection';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '../ui/command';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';


interface EditSectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pageIndex: number;
  sectionIndex: number;
  section: PageSection;
  onSave: (newProps: any) => void;
}

const SectionPreview = ({ section, products, collections }: { section: PageSection, products: Product[], collections: Collection[] }) => {
    switch (section.type) {
        case 'hero':
            return <HeroSection section={section} />;
        case 'featured-products':
            return <FeaturedProductsSection section={section} products={products} />;
        case 'collections':
            return <CollectionsSection section={section} collections={collections} />;
        case 'faq':
            return <FaqSection section={section} />;
        case 'image-with-text':
            return <ImageWithTextSection section={section} />;
        case 'testimonials':
            return <TestimonialsSection section={section} />;
        case 'spacer':
            return <SpacerSection section={section} />;
        default:
            return (
                <div className="flex items-center justify-center h-48 bg-muted rounded-md">
                    <p className="text-muted-foreground">No preview available for this section type.</p>
                </div>
            );
    }
}

const processAndUploadImage = async (fileOrDataUrl: File | string, context: string) => {
    let dataUrl: string;
    if (typeof fileOrDataUrl === 'string') {
        dataUrl = fileOrDataUrl;
    } else {
        dataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(fileOrDataUrl);
        });
    }

    const uploadedUrl = await uploadImageAndGetURL(dataUrl, 'sections', context);
    return uploadedUrl;
};


const HeroForm = ({ control, setValue, watch, getValues }: { control: any, setValue: any, watch: any, getValues: any }) => {
    const imageUrl = watch('imageUrl');
    const height = watch('height');
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isGeneratingText, setIsGeneratingText] = useState<false | 'title' | 'subtitle'>(false);
    const [isImageGeneratorOpen, setIsImageGeneratorOpen] = useState(false);
    const { toast } = useToast();

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                const uploadedUrl = await processAndUploadImage(file, "hero-background");
                setValue('imageUrl', uploadedUrl, { shouldDirty: true });
            } catch (err) {
                toast({ variant: 'destructive', title: 'Upload failed' });
            } finally {
                setIsUploading(false);
            }
        }
    };
    
    const handleGenerateText = async (field: 'title' | 'subtitle') => {
        setIsGeneratingText(field);
        try {
            const currentTitle = getValues('title');
            const { title, subtitle } = await generateHeroText({ 
                topic: 'a modern, stylish e-commerce store',
                existingTitle: field === 'subtitle' ? currentTitle : undefined
            });

            if (field === 'title' && title) {
                setValue('title', title, { shouldDirty: true });
                if (subtitle) {
                    setValue('subtitle', subtitle, { shouldDirty: true });
                }
            } else if (field === 'subtitle' && subtitle) {
                setValue('subtitle', subtitle, { shouldDirty: true });
            }
            toast({ title: 'Text Generated', description: 'The AI-powered text has been added.' });
        } catch (error) {
            console.error('AI text generation failed', error);
            toast({ variant: 'destructive', title: 'Generation Failed' });
        } finally {
            setIsGeneratingText(false);
        }
    };
    
     const handleGeneratedImage = async (imageUrl: string, prompt: string) => {
        setIsUploading(true);
        try {
            const uploadedUrl = await processAndUploadImage(imageUrl, prompt);
            setValue('imageUrl', uploadedUrl, { shouldDirty: true });
            toast({ title: 'Image Generated & Uploaded', description: 'The AI-powered image has been added.' });
        } catch (error) {
             toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload the AI image." });
        } finally {
             setIsUploading(false);
             setIsImageGeneratorOpen(false);
        }
    };

    return (
    <>
    <GenerateImageDialog
        isOpen={isImageGeneratorOpen}
        onClose={() => setIsImageGeneratorOpen(false)}
        onImageGenerated={handleGeneratedImage}
        promptSuggestion={getValues('title') || 'abstract background'}
    />
    <div className="space-y-4">
        <FormField
            control={control}
            name="title"
            render={({ field }) => (
                <FormItem>
                    <div className="flex items-center justify-between">
                        <FormLabel>Title</FormLabel>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleGenerateText('title')} disabled={!!isGeneratingText}>
                           <Sparkles className="mr-2 h-4 w-4" />
                           {isGeneratingText === 'title' ? 'Generating...' : 'Generate with AI'}
                        </Button>
                    </div>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
         <div className="grid grid-cols-2 gap-4">
            <FormField
                control={control}
                name="titleColor"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Title Color</FormLabel>
                        <FormControl>
                            <Input type="color" {...field} className="p-1 h-10"/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="titleStyle"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Title Style</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="bold">Bold</SelectItem>
                                <SelectItem value="italic">Italic</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        <FormField
            control={control}
            name="subtitle"
            render={({ field }) => (
                <FormItem>
                     <div className="flex items-center justify-between">
                        <FormLabel>Subtitle</FormLabel>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleGenerateText('subtitle')} disabled={!!isGeneratingText}>
                           <Sparkles className="mr-2 h-4 w-4" />
                           {isGeneratingText === 'subtitle' ? 'Generating...' : 'Generate with AI'}
                        </Button>
                    </div>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
        <div className="grid grid-cols-2 gap-4">
            <FormField
                control={control}
                name="subtitleColor"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Subtitle Color</FormLabel>
                        <FormControl>
                            <Input type="color" {...field} className="p-1 h-10"/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="subtitleStyle"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Subtitle Style</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="bold">Bold</SelectItem>
                                <SelectItem value="italic">Italic</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        
        <div>
            <div className="flex items-center justify-between mb-2">
                <Label>Background Image</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsImageGeneratorOpen(true)}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI Generate
                </Button>
            </div>
            <div className="mt-2">
                <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/*"
                />
                <div 
                    className="aspect-video w-full rounded-md border-2 border-dashed border-muted-foreground/40 flex items-center justify-center text-center cursor-pointer relative"
                    onClick={() => imageInputRef.current?.click()}
                >
                    {isUploading ? (
                        <Loader2 className="h-8 w-8 animate-spin" />
                    ) : imageUrl ? (
                        <Image src={imageUrl} alt="Hero background preview" fill className="object-cover rounded-md" data-ai-hint="abstract background" />
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <Upload className="mx-auto h-12 w-12" />
                            <p className="mt-2">Click to upload an image</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <FormField
            control={control}
            name="height"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Section Height: {height || 60}vh</FormLabel>
                    <FormControl>
                        <Slider
                            value={[field.value || 60]}
                            onValueChange={(value) => field.onChange(value[0])}
                            min={30}
                            max={100}
                            step={5}
                        />
                    </FormControl>
                </FormItem>
            )}
        />

        <FormField
            control={control}
            name="buttonLabel"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Button Label</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            control={control}
            name="buttonHref"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Button Link</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    </div>
    </>
)};

const FeaturedProductsForm = ({ control, products = [] }: { control: any; products: Product[] }) => {
    return (
        <div className="space-y-4">
            <FormField
                control={control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="subtitle"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Subtitle</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="productIds"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Products</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant="outline" role="combobox" className="w-full justify-between h-auto">
                                        <div className="flex gap-2 flex-wrap">
                                            {field.value?.length > 0 ? (
                                                field.value.map((productId: string) => {
                                                    const product = products.find(p => p.id === productId);
                                                    return (
                                                        <Badge
                                                            key={productId}
                                                            variant="secondary"
                                                            className="flex items-center gap-1"
                                                        >
                                                            {product?.name || 'Unknown'}
                                                            <button
                                                                type="button"
                                                                className="h-3 w-3"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    field.onChange(field.value.filter((id: string) => id !== productId));
                                                                }}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </Badge>
                                                    );
                                                })
                                            ) : (
                                                <span className="font-normal text-muted-foreground">Select products</span>
                                            )}
                                        </div>
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Search products..." />
                                    <CommandEmpty>No products found.</CommandEmpty>
                                    <CommandGroup className="max-h-60 overflow-auto">
                                        {products.map((product) => (
                                            <CommandItem
                                                key={product.id}
                                                onSelect={() => {
                                                    const selected = field.value || [];
                                                    const isSelected = selected.includes(product.id);
                                                    const newSelection = isSelected
                                                        ? selected.filter((id: string) => id !== product.id)
                                                        : [...selected, product.id];
                                                    field.onChange(newSelection);
                                                }}
                                                className="cursor-pointer"
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        field.value?.includes(product.id) ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <span>{product.name}</span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
};

const CollectionsForm = ({ control }: { control: any }) => {
    return (
        <div className="space-y-4">
            <FormField
                control={control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="subtitle"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Subtitle</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
};

const ImageWithTextForm = ({ control, setValue, watch }: { control: any, setValue: any, watch: any }) => {
    const imageUrl = watch('imageUrl');
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                const uploadedUrl = await processAndUploadImage(file, "image-with-text-section");
                setValue('imageUrl', uploadedUrl, { shouldDirty: true });
            } catch (err) {
                toast({ variant: 'destructive', title: 'Upload failed' });
            } finally {
                setIsUploading(false);
            }
        }
    };

    return (
        <div className="space-y-4">
            <FormField
                control={control}
                name="title"
                render={({ field }) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>}
            />
            <FormField
                control={control}
                name="text"
                render={({ field }) => <FormItem><FormLabel>Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>}
            />
             <div>
                <Label>Image</Label>
                <div className="mt-2">
                    <input type="file" ref={imageInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    <div className="aspect-video w-full rounded-md border-2 border-dashed border-muted-foreground/40 flex items-center justify-center text-center cursor-pointer relative" onClick={() => imageInputRef.current?.click()}>
                        {isUploading ? (
                            <Loader2 className="h-8 w-8 animate-spin" />
                        ) : imageUrl ? (
                            <Image src={imageUrl} alt="Preview" fill className="object-cover rounded-md" data-ai-hint="lifestyle product" />
                        ) : (
                            <div className="text-center text-muted-foreground"><Upload className="mx-auto h-12 w-12" /><p className="mt-2">Click to upload</p></div>
                        )}
                    </div>
                </div>
            </div>
            <FormField
                control={control}
                name="buttonLabel"
                render={({ field }) => <FormItem><FormLabel>Button Label</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>}
            />
            <FormField
                control={control}
                name="buttonHref"
                render={({ field }) => <FormItem><FormLabel>Button Link</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>}
            />
             <FormField
                control={control}
                name="imagePosition"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Image Position</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent><SelectItem value="left">Left</SelectItem><SelectItem value="right">Right</SelectItem></SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
};

const SpacerForm = ({ control, watch }: { control: any, watch: any }) => {
    const height = watch('height');
    return (
        <div className="space-y-4">
            <FormField
                control={control}
                name="height"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Height: {height || 24}px</FormLabel>
                        <FormControl>
                            <Slider
                                value={[field.value || 24]}
                                onValueChange={(value) => field.onChange(value[0])}
                                min={8}
                                max={400}
                                step={4}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
};

const SectionForm = ({ section, control, setValue, watch, getValues, products }: { section: PageSection, control: any, setValue: any, watch: any, getValues: any, products: Product[] }) => {
    switch (section.type) {
        case 'hero':
            return <HeroForm control={control} setValue={setValue} watch={watch} getValues={getValues} />;
        case 'featured-products':
            return <FeaturedProductsForm control={control} products={products} />;
        case 'collections':
            return <CollectionsForm control={control} />;
        case 'image-with-text':
            return <ImageWithTextForm control={control} setValue={setValue} watch={watch}/>;
        case 'spacer':
            return <SpacerForm control={control} watch={watch} />;
        default:
            return <p>This section type cannot be edited yet.</p>;
    }
};

export function EditSectionDrawer({ isOpen, onClose, section, onSave }: EditSectionDrawerProps) {
    const form = useForm({
        defaultValues: {
            ...section.props,
            productIds: section.props.productIds || [], // Ensure productIds is an array
        }
    });
    
    const [products, setProducts] = useState<Product[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                // Fetch all products for the multi-select, regardless of section type
                const productsData = await getProducts();
                setProducts(productsData);

                if (section.type === 'collections') {
                    const collectionsData = await getCollections();
                    setCollections(collectionsData);
                }
            } catch (error) {
                console.error("Failed to load data for section preview", error);
            } finally {
                setIsLoading(false);
            }
        }
        if (isOpen) {
          loadData();
        }
    }, [section.type, isOpen]);

    const watchedProps = form.watch();

    const previewSection: PageSection = {
        ...section,
        props: watchedProps
    };

    useEffect(() => {
        form.reset({
            ...section.props,
            productIds: section.props.productIds || [],
        });
    }, [section, form]);

    const onSubmit = (data: any) => {
        onSave(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Edit Section: <span className="capitalize">{section.type.replace('-', ' ')}</span></DialogTitle>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-hidden">
                    <div className="flex flex-col">
                        <Label className="mb-2 text-sm font-medium">Controls</Label>
                        <div className="p-4 border rounded-lg overflow-y-auto">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} id="section-edit-form" className="space-y-6">
                                    <SectionForm 
                                        section={section} 
                                        control={form.control} 
                                        setValue={form.setValue} 
                                        watch={form.watch} 
                                        getValues={form.getValues}
                                        products={products}
                                    />
                                </form>
                            </Form>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <Label className="mb-2 text-sm font-medium">Live Preview</Label>
                        <div className="border rounded-lg overflow-y-auto relative bg-background">
                           <div className="transform scale-[0.85] origin-top">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-48">
                                        <p className="text-muted-foreground">Loading preview...</p>
                                    </div>
                                ) : (
                                    <SectionPreview section={previewSection} products={products} collections={collections} />
                                )}
                           </div>
                        </div>
                    </div>
                </div>
                
                <DialogFooter className="mt-auto pt-6">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" form="section-edit-form">Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
