
'use client';

import { useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PageSection } from '@/lib/types';
import Image from 'next/image';
import { Upload } from 'lucide-react';

interface EditSectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  section: PageSection;
  onSave: (newProps: any) => void;
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


const SectionForm = ({ section, control, setValue, watch }: { section: PageSection, control: any, setValue: any, watch: any }) => {
    switch (section.type) {
        case 'hero':
            return <HeroForm control={control} setValue={setValue} watch={watch} />;
        // Other cases will be added here
        default:
            return <p>This section type cannot be edited yet.</p>;
    }
};

export function EditSectionDrawer({ isOpen, onClose, section, onSave }: EditSectionDrawerProps) {
    const form = useForm({
        defaultValues: section.props,
    });

    useEffect(() => {
        form.reset(section.props);
    }, [section, form]);

    const onSubmit = (data: any) => {
        onSave(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Edit Section: <span className="capitalize">{section.type.replace('-', ' ')}</span></DialogTitle>
                        </DialogHeader>

                        <div className="py-6">
                            <SectionForm section={section} control={form.control} setValue={form.setValue} watch={form.watch} />
                        </div>
                        
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
