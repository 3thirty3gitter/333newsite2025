'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminSettingsPage() {

  const themes = [
    { name: 'Default', primary: 'bg-blue-600', accent: 'bg-orange-500', bg: 'bg-blue-50' },
    { name: 'Forest', primary: 'bg-green-700', accent: 'bg-yellow-500', bg: 'bg-green-50' },
    { name: 'Royal', primary: 'bg-purple-700', accent: 'bg-pink-500', bg: 'bg-purple-50' },
    { name: 'Mono', primary: 'bg-gray-800', accent: 'bg-gray-500', bg: 'bg-gray-100' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-headline font-bold mb-6">Settings</h1>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Theme Selection</CardTitle>
            <CardDescription>
              Choose a color palette and font combination for your storefront. Changes will be applied sitewide.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <Label>Color Palette</Label>
              <RadioGroup defaultValue="default" className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {themes.map((theme) => (
                  <div key={theme.name}>
                    <RadioGroupItem value={theme.name.toLowerCase()} id={theme.name.toLowerCase()} className="sr-only" />
                    <Label
                      htmlFor={theme.name.toLowerCase()}
                      className="block p-4 rounded-lg border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <span className="font-semibold block mb-2">{theme.name}</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${theme.primary}`} />
                        <div className={`w-6 h-6 rounded-full ${theme.accent}`} />
                        <div className={`w-6 h-6 rounded-full ${theme.bg} border`} />
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label htmlFor="headline-font">Headline Font</Label>
                <Select defaultValue="poppins">
                  <SelectTrigger id="headline-font">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="poppins" className="font-headline">Poppins</SelectItem>
                    <SelectItem value="inter" style={{fontFamily: 'Inter'}}>Inter</SelectItem>
                    <SelectItem value="lato" style={{fontFamily: 'Lato'}}>Lato</SelectItem>
                    <SelectItem value="roboto" style={{fontFamily: 'Roboto'}}>Roboto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="body-font">Body Font</Label>
                <Select defaultValue="pt-sans">
                  <SelectTrigger id="body-font">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-sans" className="font-body">PT Sans</SelectItem>
                    <SelectItem value="open-sans" style={{fontFamily: '"Open Sans"'}}>Open Sans</SelectItem>
                    <SelectItem value="source-sans" style={{fontFamily: '"Source Sans 3"'}}>Source Sans 3</SelectItem>
                    <SelectItem value="lato" style={{fontFamily: 'Lato'}}>Lato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
