
'use client';

import { useState, useTransition } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileUp, Download } from 'lucide-react';
import { importCustomers } from '@/lib/data';
import type { Customer } from '@/lib/types';
import { Label } from '../ui/label';

interface ImportCustomersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

const csvTemplateHeaders = "clientType,company,contacts,billingStreet,billingCity,billingState,billingZip,shippingStreet,shippingCity,shippingState,shippingZip,taxExempt,taxExemptionNumber,gstNumber";
const csvTemplateData = `"ORGANIZATION","Piedmont Corp","[{""name"":""John Doe"",""email"":""john@piedmont.com"",""phone"":""555-1234"",""role"":""Primary""}]","123 Main St","Anytown","CA","12345","123 Main St","Anytown","CA","12345",TRUE,"TX-123456",""\n"INDIVIDUAL","","[{""name"":""Jane Smith"",""email"":""jane@example.com"",""phone"":""555-5678"",""role"":""Primary""}]","456 Side St","Otherville","NY","54321","456 Side St","Otherville","NY","54321",FALSE,"",""`;
const csvTemplate = `${csvTemplateHeaders}\n${csvTemplateData}`;

function parseJsonField(value: string | undefined): any[] {
    if (!value) return [];
    try {
        const cleanedValue = value.replace(/""/g, '"');
        return JSON.parse(cleanedValue);
    } catch (e) {
        console.error("Failed to parse JSON field:", value, e);
        return [];
    }
}

export function ImportCustomersDialog({ isOpen, onClose, onImported }: ImportCustomersDialogProps) {
  const { toast } = useToast();
  const [isImporting, startTransition] = useTransition();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFile(file);
      setFileName(file.name);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'customers_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = () => {
    if (!csvFile) {
      toast({ variant: 'destructive', title: 'No file selected', description: 'Please select a CSV file to import.' });
      return;
    }

    startTransition(() => {
      Papa.parse<any>(csvFile, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            if (results.errors.length > 0) {
              console.error('CSV parsing errors:', results.errors);
              throw new Error(`CSV parsing errors found. Please check the file format.`);
            }
            
            const customersToImport: Omit<Customer, 'id'>[] = results.data.map(row => {
              if (!row.clientType || !row.billingStreet) {
                  console.warn('Skipping row with missing required fields:', row);
                  return null;
              }
              return {
                ...row,
                taxExempt: row.taxExempt?.toUpperCase() === 'TRUE',
                contacts: parseJsonField(row.contacts),
              };
            }).filter(p => p !== null) as Omit<Customer, 'id'>[];

            if (customersToImport.length === 0) {
              toast({ variant: 'destructive', title: 'No valid customers found', description: 'The CSV file might be empty or formatted incorrectly.' });
              return;
            }

            await importCustomers(customersToImport);
            toast({ title: 'Import Successful', description: `${customersToImport.length} customers have been imported.` });
            onImported();
            setCsvFile(null);
            setFileName('');
          } catch (error: any) {
            console.error('Import failed:', error);
            toast({
              variant: 'destructive',
              title: 'Import Failed',
              description: `An error occurred during the import. Check console for details. Error: ${error.message}`,
              duration: 9000,
            });
          }
        },
        error: (error: any) => {
          console.error('CSV parsing error:', error);
          toast({ variant: 'destructive', title: 'Parsing Error', description: `Could not parse the CSV file. Error: ${error.message}` });
        }
      });
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Customers from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk-add customers. Download the template to see the required format and columns.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="flex items-center">
                <p className="text-sm text-muted-foreground mr-4">Don't have a CSV file yet?</p>
                <Button variant="link" onClick={handleDownloadTemplate} className="p-0 h-auto">
                   <Download className="mr-2 h-4 w-4" /> Download Template
                </Button>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="csv-file">Upload CSV File</Label>
                <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                     <Label htmlFor="csv-file" className="flex-1 border rounded-md p-2 h-10 flex items-center justify-between cursor-pointer">
                        <span className="text-sm text-muted-foreground truncate">{fileName || 'Choose a file...'}</span>
                        <FileUp className="h-4 w-4 text-muted-foreground" />
                    </Label>
                </div>
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isImporting}>Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleImport} disabled={isImporting || !csvFile}>
            {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isImporting ? 'Importing...' : 'Import Customers'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
