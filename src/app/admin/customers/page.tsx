
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCustomers, deleteCustomer } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Trash2, Upload } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import type { Customer } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ImportCustomersDialog } from '@/components/admin/ImportCustomersDialog';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    setIsLoading(true);
    const customers = await getCustomers();
    setCustomers(customers);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async () => {
    if (!deletingCustomer) return;
    try {
      await deleteCustomer(deletingCustomer.id);
      toast({ title: "Success", description: "Customer deleted successfully." });
      setDeletingCustomer(null);
      fetchCustomers();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete customer." });
    }
  };

  const handleImported = () => {
    setIsImportDialogOpen(false);
    fetchCustomers();
  };

  return (
    <>
      <ImportCustomersDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImported={handleImported}
      />
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-headline font-bold">Customers</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" /> Import
            </Button>
            <Button asChild>
              <Link href="/admin/customers/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
              <CardTitle>All Customers</CardTitle>
              <CardDescription>View and manage your customer list.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company / Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">Loading customers...</TableCell>
                    </TableRow>
                ) : customers.length > 0 ? (
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                          {customer.clientType === 'ORGANIZATION' ? customer.company : customer.contacts[0].name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{customer.contacts[0].email}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{customer.contacts[0].phone}</TableCell>
                      <TableCell>
                        <Badge variant={customer.clientType === 'ORGANIZATION' ? 'secondary' : 'outline'}>{customer.clientType}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/customers/${customer.id}/edit`}>Edit</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setDeletingCustomer(customer)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                   <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">No customers found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <AlertDialog open={!!deletingCustomer} onOpenChange={() => setDeletingCustomer(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this customer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </>
  );
}
