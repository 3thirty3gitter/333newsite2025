
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function WebsiteBuilderPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-headline font-bold">Website Editor</h1>
        {/* Maybe add save/publish buttons here later */}
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[380px_1fr] gap-6 border bg-background rounded-lg shadow-sm overflow-hidden">
        {/* Left Panel: Tools */}
        <div className="flex flex-col h-full overflow-y-auto">
           <Card className="rounded-none border-0 border-b shadow-none">
                <CardHeader>
                    <CardTitle>Editor Controls</CardTitle>
                    <CardDescription>
                        Adjust your website's appearance.
                    </CardDescription>
                </CardHeader>
           </Card>
           <div className="p-6 flex-1">
                <p className="text-muted-foreground text-center">
                    Editing tools will appear here.
                </p>
           </div>
        </div>

        {/* Right Panel: Live Preview */}
        <div className="bg-muted/40 h-full flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-inner">
                 <iframe
                    src="/"
                    title="Website Preview"
                    className="w-full h-full border-0"
                />
            </div>
        </div>
      </div>
    </div>
  );
}
