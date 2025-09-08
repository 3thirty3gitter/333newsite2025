
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
import { importProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import { Label } from '../ui/label';

interface ImportProductsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

const csvTemplateHeaders = "name,description,longDescription,price,category,images,variants,inventory";
const csvTemplateData = `"Example T-Shirt","A cool example shirt.","This is a longer description for the cool example shirt.",19.99,"Apparel","https://picsum.photos/400/400?random=1,https://picsum.photos/400/400?random=2","{""type"":""Size"",""options"":[{""value"":""S""},{""value"":""M""},{""value"":""L""}]};{""type"":""Color"",""options"":[{""value"":""Red""},{""value"":""Blue""}]}","{""id"":""S-Red"",""price"":21.99,""stock"":10};{""id"":""M-Blue"",""price"":22.99,""stock"":5}"`;
const csvTemplate = `${csvTemplateHeaders}\n${csvTemplateData}`;

export function ImportProductsDialog({ isOpen, onClose, onImported }: ImportProductsDialogProps) {
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
    link.setAttribute('download', 'products_template.csv');
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
              throw new Error(`CSV parsing errors: ${JSON.stringify(results.errors)}`);
            }
            
            const productsToImport: Omit<Product, 'id'>[] = results.data.map(row => {
              // Basic validation and type conversion
              const price = parseFloat(row.price);
              if (isNaN(price)) {
                console.warn(`Skipping row with invalid price:`, row);
                return null;
              }

              return {
                name: row.name || 'Untitled Product',
                description: row.description || '',
                longDescription: row.longDescription || '',
                price: price,
                category: row.category || 'Uncategorized',
                images: row.images ? row.images.split(',') : [],
                variants: row.variants ? JSON.parse(row.variants.replace(/""/g, '"')) : [],
                inventory: row.inventory ? JSON.parse(row.inventory.replace(/""/g, '"')) : [],
              };
            }).filter(p => p !== null) as Omit<Product, 'id'>[];

            if (productsToImport.length === 0) {
              toast({ variant: 'destructive', title: 'No valid products found', description: 'The CSV file might be empty or formatted incorrectly.' });
              return;
            }

            await importProducts(productsToImport);
            toast({ title: 'Import Successful', description: `${productsToImport.length} products have been imported.` });
            onImported();
          } catch (error: any) {
            console.error('Import failed:', error);
            toast({
              variant: 'destructive',
              title: 'Import Failed',
              description: `An error occurred during the import. Check console for details. Error: ${error.message}`,
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
          <DialogTitle>Import Products from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk-add products. Download the template to see the required format and columns.
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
            {isImporting ? 'Importing...' : 'Import Products'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
