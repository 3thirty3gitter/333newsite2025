
'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PageSection, Product } from '@/lib/types';
import Image from 'next/image';
import { Upload } from 'lucide-react';
import { HeroSection } from '../sections/HeroSection';
import { FeaturedProductsSection } from '../sections/FeaturedProductsSection';
import { Slider } from '../ui/slider';
import { getProducts } from '@/lib/data';

interface EditSectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  section: PageSection;
  onSave: (newProps: any) => void;
}

const SectionPreview = ({ section, products }: { section: PageSection, products: Product[] }) => {
    switch (section.type) {
        case 'hero':
            return <HeroSection section={section} />;
        case 'featured-products':
            return <FeaturedProductsSection section={section} products={products} />;
        default:
            return (
                <div className="flex items-center justify-center h-48 bg-muted rounded-md">
                    <p className="text-muted-foreground">No preview available for this section type.</p>
                </div>
            );
    }
}

const HeroForm = ({ control, setValue, watch }: { control: any, setValue: any, watch: any }) => {
    const imageUrl = watch('imageUrl');
    const imageInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setValue('imageUrl', e.target?.result as string, { shouldDirty: true });
            };
            reader.readAsDataURL(file);
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
                        <Image src={imageUrl} alt="Hero background preview" fill className="object-cover rounded-md" />
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


const SectionForm = ({ section, control, setValue, watch }: { section: PageSection, control: any, setValue: any, watch: any }) => {
    switch (section.type) {
        case 'hero':
            return <HeroForm control={control} setValue={setValue} watch={watch} />;
        case 'featured-products':
            return <FeaturedProductsForm control={control} watch={watch} />;
        default:
            return <p>This section type cannot be edited yet.</p>;
    }
};

export function EditSectionDrawer({ isOpen, onClose, section, onSave }: EditSectionDrawerProps) {
    const form = useForm({
        defaultValues: section.props,
    });
    
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    useEffect(() => {
        if (section.type === 'featured-products') {
            setIsLoadingProducts(true);
            getProducts()
                .then(setProducts)
                .finally(() => setIsLoadingProducts(false));
        }
    }, [section.type]);

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
                                <form onSubmit={form.handleSubmit(onSubmit)} id="section-edit-form">
                                    <SectionForm section={section} control={form.control} setValue={form.setValue} watch={form.watch} />
                                </form>
                            </Form>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <Label className="mb-2 text-sm font-medium">Live Preview</Label>
                        <div className="border rounded-lg overflow-y-auto relative bg-background">
                           <div className="transform scale-[0.8] origin-top">
                             <SectionPreview section={previewSection} products={products} />
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
