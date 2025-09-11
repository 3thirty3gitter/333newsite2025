
'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProductById } from '@/lib/data';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Text, Upload, Brush } from 'lucide-react';
import { Input } from '@/components/ui/input';

function MockupTool() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [text, setText] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);


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
  
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && canvasRef.current && textRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const textRect = textRef.current.getBoundingClientRect();
      
      let x = e.clientX - canvasRect.left - textRect.width / 2;
      let y = e.clientY - canvasRect.top - textRect.height / 2;

      // Constrain within canvas boundaries
      x = Math.max(0, Math.min(x, canvasRect.width - textRect.width));
      y = Math.max(0, Math.min(y, canvasRect.height - textRect.height));

      setTextPosition({ x, y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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
               <div className="space-y-2">
                 <label className="text-sm font-medium">Add Text</label>
                 <Input 
                   placeholder="Your Text Here"
                   value={text}
                   onChange={(e) => setText(e.target.value)}
                 />
               </div>
              <Button variant="outline" className="w-full justify-start" disabled>
                <Upload className="mr-2" /> Upload Image
              </Button>
               <Button variant="outline" className="w-full justify-start" disabled>
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
              <div 
                ref={canvasRef}
                className="aspect-square w-full bg-muted/50 rounded-lg flex items-center justify-center relative overflow-hidden"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp} // Stop dragging if mouse leaves canvas
              >
                {isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : error ? (
                  <p className="text-destructive font-medium">{error}</p>
                ) : product ? (
                   <>
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                    />
                    {text && (
                       <div
                          ref={textRef}
                          className="absolute text-4xl font-bold p-2 cursor-grab select-none"
                          style={{ 
                            left: `${textPosition.x}px`, 
                            top: `${textPosition.y}px`,
                            color: '#000000', // Basic color, can be made customizable later
                            textShadow: '1px 1px 2px #ffffff',
                          }}
                          onMouseDown={handleMouseDown}
                        >
                          {text}
                        </div>
                    )}
                   </>
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
