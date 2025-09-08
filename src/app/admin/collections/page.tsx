'use client';

import { getCategories, updateCategory, deleteCategory } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddCollectionForm } from "@/components/admin/AddCollectionForm";
import { useEffect, useState } from "react";
import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCollection, setEditingCollection] = useState<Category | null>(null);
  const [deletingCollection, setDeletingCollection] = useState<Category | null>(null);
  const [updatedName, setUpdatedName] = useState("");
  const { toast } = useToast();

  const fetchCollections = async () => {
    setIsLoading(true);
    const fetchedCollections = await getCategories();
    setCollections(fetchedCollections);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleEditClick = (collection: Category) => {
    setEditingCollection(collection);
    setUpdatedName(collection.name);
  };

  const handleUpdate = async () => {
    if (!editingCollection || !updatedName.trim()) return;
    try {
      await updateCategory(editingCollection.id, updatedName.trim());
      toast({ title: "Success", description: "Collection updated successfully." });
      setEditingCollection(null);
      fetchCollections();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update collection." });
    }
  };

  const handleDelete = async () => {
    if (!deletingCollection) return;
    try {
      await deleteCategory(deletingCollection.id);
      toast({ title: "Success", description: "Collection deleted successfully." });
      setDeletingCollection(null);
      fetchCollections();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete collection." });
    }
  };

  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-headline font-bold">Collections</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <AddCollectionForm onCollectionAdded={fetchCollections} />
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
                    <TableHead className="w-[50px]"><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">Loading...</TableCell>
                    </TableRow>
                  ) : collections.length > 0 ? (
                    collections.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>
                           <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onSelect={() => handleEditClick(category)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>Edit</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setDeletingCollection(category)} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Delete</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                           </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">No collections found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingCollection} onOpenChange={() => setEditingCollection(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Collection</DialogTitle>
            </DialogHeader>
            <div className="py-4">
                <Label htmlFor="collection-name">Collection Name</Label>
                <Input id="collection-name" value={updatedName} onChange={(e) => setUpdatedName(e.target.value)} />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleUpdate}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingCollection} onOpenChange={() => setDeletingCollection(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
