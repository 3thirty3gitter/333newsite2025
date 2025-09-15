
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Rocket, Mail, ShoppingCart } from "lucide-react";

const integrations = [
    {
        name: "Printful",
        description: "Sync your products for print-on-demand fulfillment.",
        icon: <Rocket className="h-6 w-6" />,
        connected: false,
    },
    {
        name: "Mailchimp",
        description: "Connect your customer list for email marketing campaigns.",
        icon: <Mail className="h-6 w-6" />,
        connected: true,
    },
    {
        name: "Shopify",
        description: "Import products and sync orders with your Shopify store.",
        icon: <ShoppingCart className="h-6 w-6" />,
        connected: false,
    }
]

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            This page is for general application settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>More settings will be available here in the future.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>Connect your store to third-party services.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col">
                {integrations.map((integration, index) => (
                    <div key={integration.name}>
                        <div className="flex items-center gap-4 py-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-lg">
                                {integration.icon}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">{integration.name}</p>
                                <p className="text-sm text-muted-foreground">{integration.description}</p>
                            </div>
                            <Button variant={integration.connected ? 'secondary' : 'outline'}>
                                {integration.connected ? 'Manage' : 'Connect'}
                            </Button>
                        </div>
                        {index < integrations.length - 1 && <Separator />}
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
