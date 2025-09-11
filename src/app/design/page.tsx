
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProductById } from '@/lib/data';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Text, Upload, Brush } from 'lucide-react';

function MockupTool() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setError('No product selected. Please choose a product to design.');
      setIsLoading(false);
      return;
    }

    async function fetchProduct() {
      setIsLoading(true);
      try {
        const fetchedProduct = await getProductById(productId as string);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
        } else {
          setError('Product not found.');
        }
      } catch (e) {
        setError('Failed to load product details.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-headline font-bold mb-8">Product Mockup Tool</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Panel: Controls */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Design Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">Select a tool to start designing your product.</p>
              <Button variant="outline" className="w-full justify-start">
                <Text className="mr-2" /> Add Text
              </Button>
               <Button variant="outline" className="w-full justify-start">
                <Upload className="mr-2" /> Upload Image
              </Button>
               <Button variant="outline" className="w-full justify-start">
                <Brush className="mr-2" /> Choose Clipart
              </Button>
              {/* More controls will be added here */}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="aspect-square w-full bg-muted/50 rounded-lg flex items-center justify-center relative overflow-hidden">
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : error ? (
                  <p className="text-destructive font-medium">{error}</p>
                ) : product ? (
                   <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                    />
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

export default function DesignPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MockupTool />
        </Suspense>
    )
}
