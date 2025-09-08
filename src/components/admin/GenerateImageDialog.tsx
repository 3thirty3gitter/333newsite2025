
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2 } from 'lucide-react';
import { generateImage } from '@/ai/flows/generate-image';

interface GenerateImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImageGenerated: (imageUrl: string, prompt: string) => void;
  promptSuggestion?: string;
}

const formSchema = z.object({
  prompt: z.string().min(5, 'Prompt must be at least 5 characters'),
});

export function GenerateImageDialog({ isOpen, onClose, onImageGenerated, promptSuggestion }: GenerateImageDialogProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  useEffect(() => {
    if (promptSuggestion) {
      form.setValue('prompt', promptSuggestion);
    }
  }, [promptSuggestion, form, isOpen]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true);
    try {
      const result = await generateImage({ prompt: values.prompt });
      if (result.imageUrl) {
        onImageGenerated(result.imageUrl, values.prompt);
        onClose();
        form.reset();
      } else {
        throw new Error('AI did not return an image.');
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
      toast({
        variant: 'destructive',
        title: 'Error Generating Image',
        description: 'Could not generate image. Please check the console for details and try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!isGenerating) {
            form.reset({ prompt: promptSuggestion || '' });
            onClose();
        }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary"/>
            Generate Image with AI
          </DialogTitle>
          <DialogDescription>
            Describe the image you want to create. Be specific for the best results.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Prompt</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., a vibrant display of summer hats" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isGenerating}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isGenerating}>
                {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isGenerating ? 'Generating...' : 'Generate'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
