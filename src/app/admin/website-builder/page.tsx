
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { getThemeSettings, updateThemeSettings } from "@/lib/settings";
import { MenuItem, Page, PageSection, SectionType, ThemeSettings } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripVertical, Plus, Trash2, Upload, LayoutTemplate, Pencil, Home, File, Settings, Loader2 } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { useFieldArray, useForm, useFormContext } from "react-hook-form";
import * as z from 'zod';
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditSectionDrawer } from "@/components/admin/EditSectionDrawer";
import { cn } from "@/lib/utils";
import { AddPageDialog } from "@/components/admin/AddPageDialog";
import { uploadImageAndGetURL } from "@/lib/data";

const menuItemSchema = z.object({
    label: z.string().min(1, "Label is required"),
    href: z.string().min(1, "URL is required"),
});

const pageSectionSchema = z.object({
  id: z.string(),
  type: z.string(),
  props: z.record(z.any()).and(z.object({
    height: z.number().optional()
  })),
});

const pageSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Page name is required"),
    path: z.string().min(1, "Page path is required").refine(val => val.startsWith('/'), { message: "Path must start with /" }),
    sections: z.array(pageSectionSchema).optional(),
})

const formSchema = z.object({
    logoUrl: z.string().optional(),
    logoWidth: z.number().min(20).max(300),
    menuItems: z.array(menuItemSchema),
    headerType: z.string().optional(),
    pages: z.array(pageSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const sectionDefaults: Record<SectionType, Omit<PageSection, 'id'>> = {
  hero: {
    type: 'hero',
    props: {
      title: 'New Hero Title',
      subtitle: 'This is a new hero section. Customize it!',
      imageUrl: `https://picsum.photos/1920/1080?random=${Math.floor(Math.random() * 1000)}`,
      buttonLabel: 'Learn More',
      buttonHref: '#',
      height: 60,
    }
  },
  'featured-products': {
    type: 'featured-products',
    props: {
      title: 'New Featured Products',
      subtitle: 'Our finest selection, just for you.',
      count: 4,
    }
  },
  testimonials: {
    type: 'testimonials',
    props: {
      title: 'Customer Stories',
      subtitle: 'Hear from our happy customers.',
      testimonials: [
        {
            name: 'Alex R.',
            title: 'Happy Customer',
            quote: "This is a fantastic product! I'm so glad I found it. It has completely changed my workflow for the better. Highly recommended to everyone.",
            avatarUrl: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}`,
        },
        {
            name: 'Sam B.',
            title: 'Frequent User',
            quote: "I use this every day. The quality and attention to detail are second to none. The support team is also incredibly responsive and helpful.",
            avatarUrl: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}`,
        },
      ]
    }
  },
  'image-with-text': {
    type: 'image-with-text',
    props: {
      title: 'Image With Text',
      text: 'Pair a custom image with a title and text to highlight a product, collection, or blog post. Add a button to link to a page or a product.',
      imageUrl: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
      buttonLabel: 'Shop Now',
      buttonHref: '#',
      imagePosition: 'left'
    }
  },
  'faq': {
    type: 'faq',
    props: {
      title: 'Frequently Asked Questions',
      subtitle: 'Find answers to common questions below.',
      items: [
        {
          question: 'What is the return policy?',
          answer: 'You can return any item within 30 days of purchase for a full refund. The item must be in its original condition.'
        },
        {
          question: 'Do you ship internationally?',
          answer: 'Yes, we ship to most countries worldwide. Shipping costs will be calculated at checkout based on your location.'
        },
        {
          question: 'How can I track my order?',
          answer: 'Once your order has shipped, you will receive an email with a tracking number and a link to the carrier\'s website.'
        }
      ]
    }
  },
  'collections': {
    type: 'collections',
    props: {
      title: 'Shop by Collection',
      subtitle: 'Browse our curated collections to find exactly what you need.',
    }
  }
}

function PageSectionsEditor({ activePageIndex }: { activePageIndex: number }) {
  const form = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `pages.${activePageIndex}.sections`,
    keyName: "keyId", // To avoid conflicts with our `id` field
  });
  const [editingSection, setEditingSection] = useState<{ pageIndex: number; section: PageSection; sectionIndex: number } | null>(null);

  const handleAddSection = (type: SectionType) => {
    const newSection = {
      ...sectionDefaults[type],
      id: `${type}-${Date.now()}`
    };
    append(newSection);
  }

  const handleSaveSection = (pageIndex: number, sectionIndex: number, newProps: any) => {
      const currentSection = form.getValues(`pages.${pageIndex}.sections.${sectionIndex}`);
      const updatedSection = { ...currentSection, props: newProps };

      const currentPage = form.getValues(`pages.${pageIndex}`);
      const updatedSections = [...(currentPage.sections || [])];
      updatedSections[sectionIndex] = updatedSection;
      
      const pages = form.getValues('pages');
      pages[pageIndex].sections = updatedSections;
      form.setValue('pages', pages, { shouldDirty: true });

      setEditingSection(null);
  }

  return (
    <>
    <AccordionItem value="item-2" key={activePageIndex}>
      <AccordionTrigger className="font-semibold text-lg">Page Sections</AccordionTrigger>
      <AccordionContent className="space-y-6 pt-4">
        <div className="space-y-3">
          {fields.map((field, index) => (
            <Card key={field.keyId} className="p-3">
              <div className="flex items-center gap-3">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                <div className="flex-1">
                  <p className="font-medium capitalize">{field.type.replace('-', ' ')}</p>
                  <p className="text-xs text-muted-foreground">ID: {field.id}</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingSection({ pageIndex: activePageIndex, section: field as PageSection, sectionIndex: index })}>
                  <Pencil className="mr-2 h-3 w-3" />
                  Edit
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add Section
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            <DropdownMenuItem onSelect={() => handleAddSection('hero')}>Hero</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleAddSection('featured-products')}>Featured Products</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleAddSection('collections')}>Collections</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleAddSection('testimonials')}>Testimonials</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleAddSection('image-with-text')}>Image With Text</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleAddSection('faq')}>FAQ</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </AccordionContent>
    </AccordionItem>
    {editingSection && (
        <EditSectionDrawer
            isOpen={!!editingSection}
            onClose={() => setEditingSection(null)}
            pageIndex={editingSection.pageIndex}
            section={editingSection.section}
            sectionIndex={editingSection.sectionIndex}
            onSave={(newProps) => handleSaveSection(editingSection.pageIndex, editingSection.sectionIndex, newProps)}
        />
    )}
    </>
  );
}

export default function WebsiteBuilderPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [activePageIndex, setActivePageIndex] = useState(0);
    const [isAddPageDialogOpen, setIsAddPageDialogOpen] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            logoUrl: '',
            logoWidth: 140,
            menuItems: [],
            headerType: 'standard',
            pages: [],
        },
    });

    const { fields: menuFields, append: appendMenu, remove: removeMenu } = useFieldArray({
        control: form.control,
        name: "menuItems",
    });

    const { fields: pageFields, append: appendPage, remove: removePage, update: updatePage } = useFieldArray({
        control: form.control,
        name: "pages",
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
                    pages: settings.pages || [],
                });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load theme settings.' });
            } finally {
                setIsLoading(false);
            }
        }
        loadSettings();
    }, [form, toast]);
    
    const pages = form.watch('pages');
    
    const reloadPreview = (path?: string) => {
        const iframe = document.querySelector('iframe');
        if (iframe) {
            const targetPath = path || pages?.[activePageIndex]?.path || '/';
            if (iframe.contentWindow) {
                iframe.contentWindow.location.href = `${targetPath}?_=${new Date().getTime()}`;
            } else {
                iframe.src = `${targetPath}?_=${new Date().getTime()}`;
            }
        }
    };
    
    useEffect(() => {
        if (!isLoading && pages && pages.length > 0) {
            reloadPreview(pages[activePageIndex].path);
        }
    }, [activePageIndex, isLoading]);


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
                reloadPreview(pages?.[activePageIndex]?.path);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to save changes.' });
            }
        });
    }

    const processAndUploadImage = async (file: File) => {
      setIsUploading(true);
      try {
          const dataUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.readAsDataURL(file);
          });
          
          const uploadedUrl = await uploadImageAndGetURL(dataUrl, 'logos', 'logo');
          form.setValue('logoUrl', uploadedUrl, { shouldDirty: true });

      } catch (error) {
          console.error("Image upload failed:", error);
          toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload the image." });
      } finally {
          setIsUploading(false);
      }
    };

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processAndUploadImage(file);
        }
    };
    
    const handleAddNewPage = (pageData: Omit<Page, 'id' | 'sections'>) => {
        const newPage: Page = {
            id: `page-${Date.now()}`,
            ...pageData,
            sections: [], // Start with no sections
        };
        appendPage(newPage);
        setActivePageIndex(pageFields.length); // Switch to the new page
        setIsAddPageDialogOpen(false);
    }
    
    const logoUrl = form.watch('logoUrl');

    if (isLoading) {
        return (
             <div className="h-full flex flex-col">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-[380px_1fr] gap-6 border bg-background rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6 border-b">
                        <Skeleton className="h-8 w-1/2 mb-4" />
                    </div>
                    <div className="p-6">
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
    <>
    <Form {...form}>
        <div className="h-full flex flex-col">
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-[380px_1fr] gap-6 border bg-background rounded-lg shadow-sm overflow-hidden">
                    {/* Left Panel: Tools */}
                    <div className="flex flex-col h-full">
                       <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                         <div className="flex items-center justify-between p-4 border-b">
                            <h1 className="text-xl font-headline font-bold">Website Editor</h1>
                            <Button type="submit" disabled={isSaving || isUploading}>
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                         </div>
                       </div>
                       <div className="flex-1 overflow-y-auto">
                            <div className="p-6">
                                <Accordion type="multiple" defaultValue={['item-0', 'item-1', 'item-2']} className="w-full">
                                    <AccordionItem value="item-0">
                                        <AccordionTrigger className="font-semibold text-lg">Pages</AccordionTrigger>
                                        <AccordionContent className="space-y-4 pt-4">
                                            <div className="space-y-2">
                                                {pageFields.map((page, index) => (
                                                     <Card key={page.id} className={cn("cursor-pointer hover:bg-muted/50", activePageIndex === index && "border-primary ring-1 ring-primary")}>
                                                        <CardContent className="p-3 flex items-center gap-3" onClick={() => setActivePageIndex(index)}>
                                                            {page.path === '/' ? <Home className="h-4 w-4 text-muted-foreground" /> : <File className="h-4 w-4 text-muted-foreground" />}
                                                            <span className="flex-1 font-medium">{page.name}</span>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="h-4 w-4" /></Button>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                            <Button type="button" variant="outline" className="w-full" onClick={() => setIsAddPageDialogOpen(true)}>
                                                <Plus className="mr-2 h-4 w-4" /> Add New Page
                                            </Button>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger className="font-semibold text-lg">Header</AccordionTrigger>
                                        <AccordionContent className="space-y-6 pt-4">
                                            
                                            <FormField
                                                control={form.control}
                                                name="headerType"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Header Style</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a header style" />
                                                            </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="standard">Standard</SelectItem>
                                                                <SelectItem value="centered">Centered</SelectItem>
                                                                <SelectItem value="split">Split Navigation</SelectItem>
                                                                <SelectItem value="minimalist">Minimalist</SelectItem>
                                                                <SelectItem value="logo-top">Logo Top / Nav Below</SelectItem>
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
                                                            {isUploading ? (
                                                                <div className="text-center text-muted-foreground">
                                                                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                                                                    <p className="mt-2 text-sm">Uploading...</p>
                                                                </div>
                                                            ) : logoUrl ? (
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
                                                    <Button type="button" size="sm" variant="outline" onClick={() => appendMenu({ label: '', href: '' })}>
                                                        <Plus className="mr-2 h-4 w-4" /> Add Link
                                                    </Button>
                                                </div>
                                                <div className="space-y-3">
                                                    {menuFields.map((field, index) => (
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
                                                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 mt-6" onClick={() => removeMenu(index)}>
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </div>
                                                        </Card>
                                                    ))}
                                                </div>
                                            </div>

                                        </AccordionContent>
                                    </AccordionItem>
                                    
                                    {pages && pages.length > 0 && (
                                        <PageSectionsEditor activePageIndex={activePageIndex} />
                                    )}

                                </Accordion>
                            </div>
                       </div>
                    </div>

                    {/* Right Panel: Live Preview */}
                    <div className="bg-muted/40 h-full flex items-center justify-center p-4">
                        <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-inner">
                            <iframe
                                key={pages?.[activePageIndex]?.id || 'initial'}
                                src={pages?.[activePageIndex]?.path || '/'}
                                title="Website Preview"
                                className="w-full h-full border-0"
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </Form>
    
    <AddPageDialog
        isOpen={isAddPageDialogOpen}
        onClose={() => setIsAddPageDialogOpen(false)}
        onAddPage={handleAddNewPage}
        existingPaths={pages?.map(p => p.path) || []}
    />
    </>
  );
}

    

    