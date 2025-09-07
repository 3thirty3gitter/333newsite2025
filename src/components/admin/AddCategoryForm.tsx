'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { addCategory } from '@/lib/data';

const formSchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
});

export function AddCategoryForm() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await addCategory({ name: values.name });
      toast({
        title: 'Category Created',
        description: `The category "${values.name}" has been successfully created.`,
      });
      form.reset();
      router.refresh(); // To show the new category in the list
    } catch (error) {
      console.error('Failed to create category:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create category. Please try again.',
      });
    }
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Add New Category</CardTitle>
            <CardDescription>Create a new category for your products.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Category Name</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., Footwear" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                    {form.formState.isSubmitting ? 'Creating...' : 'Create Category'}
                </Button>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
