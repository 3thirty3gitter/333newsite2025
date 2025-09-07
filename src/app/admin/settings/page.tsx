import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-headline font-bold mb-6">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            This page is for general application settings. The website visual editor has been moved to its own "Website Editor" page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>More settings will be available here in the future.</p>
        </CardContent>
      </Card>
    </div>
  );
}
