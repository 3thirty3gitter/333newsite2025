
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
import { Upload } from 'lucide-react';
import { HeroSection } from '../sections/HeroSection';
import { FeaturedProductsSection } from '../sections/FeaturedProductsSection';
import { Slider } from '../ui/slider';
import { getCollections, getProducts } from '@/lib/data';
import { CollectionsSection } from '../sections/CollectionsSection';
import { FaqSection } from '../sections/FaqSection';
import { ImageWithTextSection } from '../sections/ImageWithTextSection';
import { TestimonialsSection } from '../sections/TestimonialsSection';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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
        default:
            return (
                <div className="flex items-center justify-center h-48 bg-muted rounded-md">
                    <p className="text-muted-foreground">No preview available for this section type.</p>
                </div>
            );
    }
}

const processImage = (file: File, callback: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            callback(dataUrl);
        };
        img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
};


const HeroForm = ({ control, setValue, watch }: { control: any, setValue: any, watch: any }) => {
    const imageUrl = watch('imageUrl');
    const imageInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processImage(file, (dataUrl) => {
                setValue('imageUrl', dataUrl, { shouldDirty: true });
            });
        }
    };
    
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
        
        <div>
            <Label>Background Image</Label>
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
                    {imageUrl ? (
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
)};

const FeaturedProductsForm = ({ control, watch }: { control: any, watch: any }) => {
    const count = watch('count');
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
                name="count"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Number of products: {count}</FormLabel>
                        <FormControl>
                            <Slider
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                min={2}
                                max={12}
                                step={1}
                            />
                        </FormControl>
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

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
             processImage(file, (dataUrl) => {
                setValue('imageUrl', dataUrl, { shouldDirty: true });
            });
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
                        {imageUrl ? <Image src={imageUrl} alt="Preview" fill className="object-cover rounded-md" data-ai-hint="lifestyle product" /> : <div className="text-center text-muted-foreground"><Upload className="mx-auto h-12 w-12" /><p className="mt-2">Click to upload</p></div>}
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

const SectionForm = ({ section, control, setValue, watch }: { section: PageSection, control: any, setValue: any, watch: any }) => {
    switch (section.type) {
        case 'hero':
            return <HeroForm control={control} setValue={setValue} watch={watch} />;
        case 'featured-products':
            return <FeaturedProductsForm control={control} watch={watch} />;
        case 'collections':
            return <CollectionsForm control={control} />;
        case 'image-with-text':
            return <ImageWithTextForm control={control} setValue={setValue} watch={watch}/>;
        default:
            return <p>This section type cannot be edited yet.</p>;
    }
};

export function EditSectionDrawer({ isOpen, onClose, section, onSave }: EditSectionDrawerProps) {
    const form = useForm({
        defaultValues: section.props,
    });
    
    const [products, setProducts] = useState<Product[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                if (section.type === 'featured-products') {
                    const productsData = await getProducts();
                    setProducts(productsData);
                } else if (section.type === 'collections') {
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
        form.reset(section.props);
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
                                    <SectionForm section={section} control={form.control} setValue={form.setValue} watch={form.watch} />
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
