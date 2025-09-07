import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function WebsiteBuilderPage() {
  return (
    <div>
      <h1 className="text-3xl font-headline font-bold mb-6">Website Editor</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            This is where the powerful, smart, and fast website editor will be.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This feature is currently under construction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
