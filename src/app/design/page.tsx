
'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { getProductById, getProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Text, Upload, Brush } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

function MockupTool() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [text, setText] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState({ x: 70, y: 70 });
  const [draggingElement, setDraggingElement] = useState<'text' | 'image' | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    async function fetchAllProducts() {
        try {
            const fetchedProducts = await getProducts();
            setAllProducts(fetchedProducts);
        } catch (e) {
            console.error("Failed to load products list", e);
        }
    }
    fetchAllProducts();
  }, []);

  useEffect(() => {
    if (!productId) {
      setError('No product selected. Please choose a product to design.');
      setIsLoading(false);
      setProduct(null);
      return;
    }

    async function fetchProduct() {
      setIsLoading(true);
      setError(null);
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
  
  const handleProductSelect = (selectedProductId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('productId', selectedProductId);
    router.push(`${pathname}?${params.toString()}`);
  }

  const handleMouseDown = (e: React.MouseEvent, element: 'text' | 'image') => {
    e.preventDefault();
    setDraggingElement(element);
  };
  
  useEffect(() => {
    const handleMouseUp = () => {
      setDraggingElement(null);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingElement || !canvasRef.current) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      let newX = e.clientX - canvasRect.left;
      let newY = e.clientY - canvasRect.top;

      if (draggingElement === 'text' && textRef.current) {
        const textRect = textRef.current.getBoundingClientRect();
        newX -= textRect.width / 2;
        newY -= textRect.height / 2;
        newX = Math.max(0, Math.min(newX, canvasRect.width - textRect.width));
        newY = Math.max(0, Math.min(newY, canvasRect.height - textRect.height));
        setTextPosition({ x: newX, y: newY });
      } else if (draggingElement === 'image' && imageRef.current) {
        const imgRect = imageRef.current.getBoundingClientRect();
        newX -= imgRect.width / 2;
        newY -= imgRect.height / 2;
        newX = Math.max(0, Math.min(newX, canvasRect.width - imgRect.width));
        newY = Math.max(0, Math.min(newY, canvasRect.height - imgRect.height));
        setImagePosition({ x: newX, y: newY });
      }
    };
    
    if (draggingElement) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingElement]);
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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
                 <Label>Select a Product</Label>
                 <Select onValueChange={handleProductSelect} value={productId || ''}>
                    <SelectTrigger>
                        <SelectValue placeholder="Choose a product..." />
                    </SelectTrigger>
                    <SelectContent>
                        {allProducts.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <Label>Add Text</Label>
                 <Input 
                   placeholder="Your Text Here"
                   value={text}
                   onChange={(e) => setText(e.target.value)}
                 />
               </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
              <Button variant="outline" className="w-full justify-start" onClick={() => fileInputRef.current?.click()}>
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
                          onMouseDown={(e) => handleMouseDown(e, 'text')}
                        >
                          {text}
                        </div>
                    )}
                    {uploadedImage && (
                        <div
                            ref={imageRef}
                            className="absolute cursor-grab select-none"
                            style={{
                                left: `${imagePosition.x}px`,
                                top: `${imagePosition.y}px`,
                                width: '150px', // Example static size
                                height: '150px', // Example static size
                            }}
                            onMouseDown={(e) => handleMouseDown(e, 'image')}
                        >
                           <Image 
                                src={uploadedImage} 
                                alt="User uploaded design" 
                                layout="fill" 
                                className="object-contain" 
                            />
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
