
'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PageSection } from '@/lib/types';

interface EditSectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  section: PageSection;
  onSave: (newProps: any) => void;
}

const HeroForm = ({ control }: { control: any }) => (
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
            name="imageUrl"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
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
);


const SectionForm = ({ section, control }: { section: PageSection, control: any }) => {
    switch (section.type) {
        case 'hero':
            return <HeroForm control={control} />;
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
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
                        <SheetHeader>
                            <SheetTitle>Edit Section: <span className="capitalize">{section.type.replace('-', ' ')}</span></SheetTitle>
                        </SheetHeader>

                        <div className="flex-1 py-6">
                            <SectionForm section={section} control={form.control} />
                        </div>
                        
                        <SheetFooter>
                            <SheetClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </SheetClose>
                            <Button type="submit">Save Changes</Button>
                        </SheetFooter>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
}

