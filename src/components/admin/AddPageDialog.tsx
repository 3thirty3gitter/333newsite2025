
'use client';

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

interface AddPageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPage: (pageData: { name: string; path: string }) => void;
  existingPaths: string[];
}

const formSchema = z.object({
  name: z.string().min(2, 'Page name must be at least 2 characters'),
  path: z.string()
    .min(2, 'Path must be at least 2 characters')
    .startsWith('/', { message: 'Path must start with a "/"' })
    .regex(/^[a-z0-9/-]+$/, { message: 'Path can only contain lowercase letters, numbers, and hyphens' }),
});

export function AddPageDialog({ isOpen, onClose, onAddPage, existingPaths }: AddPageDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema.refine(data => !existingPaths.includes(data.path), {
      message: "This path is already in use.",
      path: ["path"],
    })),
    defaultValues: {
      name: '',
      path: '/',
    },
  });
  
  const nameValue = form.watch('name');

  // Sync path with name, creating a slug
  form.watch((value, { name, type }) => {
    if (name === 'name' && type === 'change') {
      const newPath = '/' + value.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      form.setValue('path', newPath, { shouldValidate: true });
    }
  });


  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddPage(values);
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Page</DialogTitle>
          <DialogDescription>
            Create a new page for your website. The path will be automatically generated from the name.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., About Us" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="path"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Path (URL)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., /about-us" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Create Page</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
