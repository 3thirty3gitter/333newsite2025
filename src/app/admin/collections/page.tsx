import { getCategories } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddCollectionForm } from "@/components/admin/AddCollectionForm";

export default async function CollectionsPage() {
  const collections = await getCategories();

  return (
    <div className="grid gap-6">
       <h1 className="text-3xl font-headline font-bold">Collections</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <AddCollectionForm />
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Existing Collections</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collections.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                    </TableRow>
                  ))}
                  {collections.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={1} className="text-center text-muted-foreground">No collections found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
