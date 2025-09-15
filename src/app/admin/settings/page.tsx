
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Rocket, Mail, ShoppingCart, Truck, CheckCircle, KeyRound, CreditCard } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";


const initialIntegrations = [
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
    },
    {
        name: "EasyPost",
        description: "Streamline your shipping and fulfillment process.",
        icon: <Truck className="h-6 w-6" />,
        connected: false,
    },
    {
        name: "Square",
        description: "Connect your Square account to process payments.",
        icon: <CreditCard className="h-6 w-6" />,
        connected: false,
    }
]

export default function AdminSettingsPage() {
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [easyPostKey, setEasyPostKey] = useState('');
  const { toast } = useToast();

  const handleSaveEasyPostKey = async () => {
    // In a real app, this would be a server action to securely save the key.
    // We'll simulate it here and update the UI.
    console.log("Saving EasyPost Key:", easyPostKey);
    
    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIntegrations(prev => prev.map(int => 
      int.name === "EasyPost" ? { ...int, connected: true } : int
    ));
    
    toast({
        title: "EasyPost Connected",
        description: "Your API key has been saved securely."
    });
  }

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
                    <Collapsible key={integration.name}>
                        <div>
                            <div className="flex items-center gap-4 py-4">
                                <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-lg">
                                    {integration.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{integration.name}</p>
                                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                                </div>
                                {integration.name === "EasyPost" ? (
                                    <CollapsibleTrigger asChild>
                                        <Button variant={integration.connected ? 'secondary' : 'outline'}>
                                            {integration.connected ? 'Manage' : 'Connect'}
                                        </Button>
                                    </CollapsibleTrigger>
                                ) : (
                                    <Button variant={integration.connected ? 'secondary' : 'outline'}>
                                        {integration.connected ? 'Manage' : 'Connect'}
                                    </Button>
                                )}
                            </div>
                            
                            {integration.name === 'EasyPost' && (
                                <CollapsibleContent>
                                    <div className="p-6 bg-muted/50 rounded-lg">
                                        <div className="space-y-4">
                                            <Label htmlFor="easypost-key">EasyPost API Key</Label>
                                            <div className="flex items-center gap-2">
                                                <KeyRound className="h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    id="easypost-key"
                                                    type="password"
                                                    placeholder="••••••••••••••••••••••••••••••••••••••••"
                                                    value={easyPostKey}
                                                    onChange={(e) => setEasyPostKey(e.target.value)}
                                                />
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <CollapsibleTrigger asChild>
                                                    <Button variant="ghost">Cancel</Button>
                                                </CollapsibleTrigger>
                                                <Button onClick={handleSaveEasyPostKey}>
                                                    Save & Connect
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CollapsibleContent>
                            )}

                        </div>
                        {index < integrations.length - 1 && <Separator />}
                    </Collapsible>
                ))}
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
