
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { getCollectionById, updateCollection } from '@/lib/data';
import { useEffect, useState, useRef } from 'react';
import type { Collection } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import NextImage from 'next/image';
import { generateCollectionDescription } from '@/ai/flows/generate-collection-description';
import { GenerateImageDialog } from '@/components/admin/GenerateImageDialog';

const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditCollectionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const collectionId = params.id as string;
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageGeneratorOpen, setIsImageGeneratorOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      imageUrl: '',
    },
  });

  useEffect(() => {
    async function fetchData() {
      if (!collectionId) return;
      setIsLoading(true);
      try {
        const fetchedCollection = await getCollectionById(collectionId);
        
        if (fetchedCollection) {
          setCollection(fetchedCollection);
          setImagePreview(fetchedCollection.imageUrl || null);
          
          form.reset({
            name: fetchedCollection.name,
            description: fetchedCollection.description || '',
            imageUrl: fetchedCollection.imageUrl || '',
          });
        } else {
          toast({ variant: 'destructive', title: 'Error', description: 'Collection not found.' });
          router.push('/admin/collections');
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load collection data.' });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [collectionId, form, toast, router]);

  
  const processAndSetImage = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
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
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          setImagePreview(dataUrl);
          form.setValue('imageUrl', dataUrl, { shouldDirty: true });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processAndSetImage(file);
      event.target.value = '';
    }
  };
  
  const handleGeneratedImage = (imageUrl: string) => {
    setImagePreview(imageUrl);
    form.setValue('imageUrl', imageUrl, { shouldDirty: true });
    toast({
        title: 'Image Generated',
        description: 'The AI-powered image has been set.',
    });
  }

  const handleGenerateDescription = async () => {
    const collectionName = form.getValues('name');
    if (!collectionName) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a collection name first.',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateCollectionDescription({ collectionName });
      if (result.description) {
        form.setValue('description', result.description, { shouldDirty: true });
        toast({
          title: 'Description Generated',
          description: 'The AI-powered description has been added.',
        });
      }
    } catch (error) {
      console.error('Failed to generate description:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate description. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  async function onSubmit(values: FormValues) {
    try {
      await updateCollection(collectionId, values);
      toast({
        title: 'Collection Updated',
        description: `The collection "${values.name}" has been successfully updated.`,
      });
      router.push('/admin/collections');
      router.refresh();
    } catch (error) {
      console.error('Failed to update collection:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update collection. Please try again.',
      });
    }
  }

  const collectionName = form.watch('name');

  if (isLoading) {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-9 w-48" />
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <Card>
                        <CardHeader><Skeleton className="h-7 w-1/3" /></CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-10 w-full" /></div>
                            <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-20 w-full" /></div>
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-1">
                     <Card>
                        <CardHeader><Skeleton className="h-7 w-1/2" /></CardHeader>
                        <CardContent>
                           <Skeleton className="aspect-video w-full rounded-md" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
  }

  return (
    <>
    <GenerateImageDialog 
        isOpen={isImageGeneratorOpen}
        onClose={() => setIsImageGeneratorOpen(false)}
        onImageGenerated={handleGeneratedImage}
        promptSuggestion={collectionName}
    />
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" asChild>
                <Link href="/admin/collections">
                    <ArrowLeft />
                    <span className="sr-only">Back to Collections</span>
                </Link>
                </Button>
                <h1 className="text-3xl font-headline font-bold">Edit Collection</h1>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                        <CardTitle>Collection Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Collection Name</FormLabel>
                                <FormControl>
                                <Input placeholder="e.g., Summer Collection" {...field} />
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
                                    <FormLabel>Description</FormLabel>
                                    <Button type="button" variant="outline" size="sm" onClick={handleGenerateDescription} disabled={isGenerating}>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        {isGenerating ? 'Generating...' : 'Generate with AI'}
                                    </Button>
                                </div>
                                <FormControl>
                                <Textarea placeholder="Describe the collection." {...field} />
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
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Collection Image</CardTitle>
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsImageGeneratorOpen(true)}>
                                <Sparkles className="mr-2 h-4 w-4" />
                                AI Generate
                            </Button>
                        </CardHeader>
                         <CardContent>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="imageUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">Collection Image</FormLabel>
                                            <FormControl>
                                                <div>
                                                    <input
                                                        type="file"
                                                        ref={imageInputRef}
                                                        onChange={handleImageChange}
                                                        className="hidden"
                                                        accept="image/*"
                                                    />
                                                    <div 
                                                        className="aspect-video w-full rounded-md border-2 border-dashed border-muted-foreground/40 flex items-center justify-center text-center cursor-pointer"
                                                        onClick={() => imageInputRef.current?.click()}
                                                    >
                                                        {imagePreview ? (
                                                            <NextImage src={imagePreview} alt="Collection preview" width={400} height={300} className="object-cover rounded-md" />
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
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
          
            <div className="flex justify-end gap-4 mt-8">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting || isGenerating}>
                    {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
      </Form>
    </div>
    </>
  );
}
