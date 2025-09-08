'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { addCollection } from '@/lib/data';

const formSchema = z.object({
  name: z.string().min(2, 'Collection name must be at least 2 characters'),
});

interface AddCollectionFormProps {
    onCollectionAdded: () => void;
}

export function AddCollectionForm({ onCollectionAdded }: AddCollectionFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await addCollection({ name: values.name });
      toast({
        title: 'Collection Created',
        description: `The collection "${values.name}" has been successfully created.`,
      });
      form.reset();
      onCollectionAdded(); // Callback to refresh the list
    } catch (error) {
      console.error('Failed to create collection:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create collection. Please try again.',
      });
    }
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Add New Collection</CardTitle>
            <CardDescription>Create a new collection for your products.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Collection Name</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., Footwear" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                    {form.formState.isSubmitting ? 'Creating...' : 'Create Collection'}
                </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
