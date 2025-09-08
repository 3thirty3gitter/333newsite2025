
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { getThemeSettings, updateThemeSettings } from "@/lib/settings";
import { MenuItem, ThemeSettings } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripVertical, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from 'zod';
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const menuItemSchema = z.object({
    label: z.string().min(1, "Label is required"),
    href: z.string().min(1, "URL is required"),
});

const formSchema = z.object({
    logoUrl: z.string().optional(),
    logoWidth: z.number().min(20).max(300),
    menuItems: z.array(menuItemSchema),
    headerType: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function WebsiteBuilderPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, startTransition] = useTransition();
    const [previewKey, setPreviewKey] = useState(0);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            logoUrl: '',
            logoWidth: 140,
            menuItems: [],
            headerType: 'standard',
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "menuItems",
    });

    useEffect(() => {
        async function loadSettings() {
            setIsLoading(true);
            try {
                const settings = await getThemeSettings();
                form.reset({
                    logoUrl: settings.logoUrl || '',
                    logoWidth: settings.logoWidth || 140,
                    menuItems: settings.menuItems || [{ label: 'Home', href: '/' }, { label: 'All Products', href: '/products' }],
                    headerType: settings.headerType || 'standard',
                });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load theme settings.' });
            } finally {
                setIsLoading(false);
            }
        }
        loadSettings();
    }, [form, toast]);
    
    const reloadPreview = () => {
        setPreviewKey(prevKey => prevKey + 1);
    };

    async function onSubmit(values: FormValues) {
        startTransition(async () => {
            try {
                const currentSettings = await getThemeSettings();
                const updatedSettings: ThemeSettings = {
                    ...currentSettings,
                    ...values,
                };
                await updateThemeSettings(updatedSettings);
                toast({ title: 'Success', description: 'Your changes have been saved.' });
                reloadPreview();
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to save changes.' });
            }
        });
    }

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                form.setValue('logoUrl', e.target?.result as string, { shouldDirty: true });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const logoUrl = form.watch('logoUrl');

    if (isLoading) {
        return (
             <div className="h-full flex flex-col">
                 <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-headline font-bold">Website Editor</h1>
                 </div>
                 <div className="flex-1 grid grid-cols-1 md:grid-cols-[380px_1fr] gap-6 border bg-background rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                        <Skeleton className="h-8 w-1/2 mb-4" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                    <div className="bg-muted/40 h-full flex items-center justify-center p-4">
                        <Skeleton className="w-full h-full bg-white rounded-lg" />
                    </div>
                 </div>
             </div>
        )
    }

  return (
    <Form {...form}>
        <div className="h-full flex flex-col">
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-headline font-bold">Website Editor</h1>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-[380px_1fr] gap-6 border bg-background rounded-lg shadow-sm overflow-hidden">
                    {/* Left Panel: Tools */}
                    <div className="flex flex-col h-full overflow-y-auto">
                    <Card className="rounded-none border-0 border-b shadow-none">
                            <CardHeader>
                                <CardTitle>Editor Controls</CardTitle>
                                <CardDescription>
                                    Adjust your website's appearance.
                                </CardDescription>
                            </CardHeader>
                    </Card>
                    <div className="p-6 flex-1">
                            <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger className="font-semibold text-lg">Header</AccordionTrigger>
                                    <AccordionContent className="space-y-6 pt-4">
                                        
                                        <FormField
                                            control={form.control}
                                            name="headerType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Header Style</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a header style" />
                                                        </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="standard">Standard</SelectItem>
                                                            <SelectItem value="centered">Centered</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div>
                                            <Label>Logo</Label>
                                            <Card className="mt-2">
                                                <CardContent className="p-4">
                                                    <div className="aspect-video w-full rounded-md border-2 border-dashed border-muted-foreground/40 flex items-center justify-center text-center cursor-pointer relative"
                                                         onClick={() => imageInputRef.current?.click()}
                                                    >
                                                        <input
                                                            type="file"
                                                            ref={imageInputRef}
                                                            onChange={handleLogoUpload}
                                                            className="hidden"
                                                            accept="image/*"
                                                        />
                                                        {logoUrl ? (
                                                            <Image src={logoUrl} alt="Logo preview" fill className="object-contain p-4" />
                                                        ) : (
                                                            <div className="text-center text-muted-foreground p-4">
                                                                <Upload className="mx-auto h-8 w-8" />
                                                                <p className="mt-2 text-sm">Click to upload logo</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="logoWidth"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Logo Width: {field.value}px</FormLabel>
                                                    <FormControl>
                                                        <Slider
                                                            value={[field.value]}
                                                            onValueChange={(value) => field.onChange(value[0])}
                                                            min={20}
                                                            max={300}
                                                            step={5}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <Separator />

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <Label>Navigation Menu</Label>
                                                <Button type="button" size="sm" variant="outline" onClick={() => append({ label: '', href: '' })}>
                                                    <Plus className="mr-2 h-4 w-4" /> Add Link
                                                </Button>
                                            </div>
                                            <div className="space-y-3">
                                                {fields.map((field, index) => (
                                                    <Card key={field.id} className="p-3">
                                                         <div className="flex items-start gap-2">
                                                            <GripVertical className="h-5 w-5 text-muted-foreground mt-8 cursor-grab" />
                                                            <div className="flex-1 space-y-2">
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`menuItems.${index}.label`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel className="text-xs">Label</FormLabel>
                                                                            <FormControl><Input {...field} placeholder="e.g., Home" /></FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`menuItems.${index}.href`}
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel className="text-xs">URL</FormLabel>
                                                                            <FormControl><Input {...field} placeholder="e.g., /" /></FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </div>
                                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 mt-6" onClick={() => remove(index)}>
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>

                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                    </div>
                    </div>

                    {/* Right Panel: Live Preview */}
                    <div className="bg-muted/40 h-full flex items-center justify-center p-4">
                        <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-inner">
                            <iframe
                                key={previewKey}
                                src="/"
                                title="Website Preview"
                                className="w-full h-full border-0"
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </Form>
  );
}
