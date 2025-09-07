'use client';

import { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getThemeSettings, updateThemeSettings } from '@/lib/settings';
import { palettes, fontMap } from '@/lib/theme';
import { useToast } from '@/hooks/use-toast';
import type { ThemeSettings } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const themeSettingsSchema = z.object({
  palette: z.string(),
  headlineFont: z.string(),
  bodyFont: z.string(),
});

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<ThemeSettings>({
    resolver: zodResolver(themeSettingsSchema),
    defaultValues: {
      palette: 'default',
      headlineFont: 'poppins',
      bodyFont: 'pt-sans',
    },
  });

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      const settings = await getThemeSettings();
      form.reset(settings);
      setIsLoading(false);
    }
    loadSettings();
  }, [form]);

  const onSubmit = (data: ThemeSettings) => {
    startTransition(async () => {
      try {
        await updateThemeSettings(data);
        toast({
          title: 'Theme Updated',
          description: 'Your new theme settings have been saved.',
        });
        // Force a full reload to apply new CSS variables and font links
        window.location.reload();
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not save theme settings.',
        });
      }
    });
  };
  
  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-headline font-bold mb-6">
          <Skeleton className="h-9 w-48" />
        </h1>
        <Card>
          <CardHeader>
            <CardTitle><Skeleton className="h-7 w-1/3" /></CardTitle>
            <CardDescription><Skeleton className="h-4 w-2/3" /></CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <Label><Skeleton className="h-4 w-24" /></Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label><Skeleton className="h-4 w-24" /></Label>
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Label><Skeleton className="h-4 w-24" /></Label>
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24 ml-auto" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-headline font-bold">Settings</h1>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Website Builder</CardTitle>
              <CardDescription>
                Choose a color palette and font combination for your storefront. Changes will be applied sitewide.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <FormField
                  control={form.control}
                  name="palette"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel>Color Palette</FormLabel>
                      <FormControl>
                        <RadioGroup 
                          onValueChange={field.onChange} 
                          value={field.value}
                          className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        >
                          {palettes.map((palette) => (
                             <FormItem key={palette.name}>
                                <FormControl>
                                  <RadioGroupItem value={palette.name.toLowerCase()} id={palette.name.toLowerCase()} className="sr-only" />
                                </FormControl>
                                <Label
                                  htmlFor={palette.name.toLowerCase()}
                                  className="block p-4 rounded-lg border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                  <span className="font-semibold block mb-2">{palette.name}</span>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full`} style={{ backgroundColor: palette.primary }} />
                                    <div className={`w-6 h-6 rounded-full`} style={{ backgroundColor: palette.accent }} />
                                    <div className={`w-6 h-6 rounded-full border`} style={{ backgroundColor: palette.bg }} />
                                  </div>
                                </Label>
                              </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              <div className="grid md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="headlineFont"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Headline Font</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select font" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(fontMap).map(([key, font]) => (
                            <SelectItem key={key} value={key} style={{fontFamily: font.css}}>
                              {font.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="bodyFont"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body Font</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select font" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {Object.entries(fontMap).map(([key, font]) => (
                            <SelectItem key={key} value={key} style={{fontFamily: font.css}}>
                              {font.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
