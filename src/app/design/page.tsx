
'use client';

import { Suspense, useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { getProductById, getProducts } from '@/lib/data';
import type { Product, Variant } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Text, Upload, Brush, RotateCw, Undo } from 'lucide-react';
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
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImageUrl, setActiveImageUrl] = useState<string>('');

  const initialImageState = {
    src: null,
    position: { x: 70, y: 70 },
    size: { width: 150, height: 150 },
    aspectRatio: 1,
    rotation: 0,
  };

  const [textElement, setTextElement] = useState({
    text: '',
    position: { x: 50, y: 50 },
    fontSize: 32,
    rotation: 0,
  });

  const [imageElement, setImageElement] = useState<{
    src: string | null;
    position: { x: number, y: number };
    size: { width: number, height: number };
    aspectRatio: number;
    rotation: number;
  }>(initialImageState);

  const [draggingElement, setDraggingElement] = useState<'text' | 'image' | null>(null);
  const [resizingElement, setResizingElement] = useState<'text' | 'image' | null>(null);
  const [rotatingElement, setRotatingElement] = useState<'text' | 'image' | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
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
      setSelectedColor('');
      setSelectedSize('');
      setActiveImageUrl('');
      try {
        const fetchedProduct = await getProductById(productId as string);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
          if (fetchedProduct.images && fetchedProduct.images.length > 0) {
            setActiveImageUrl(fetchedProduct.images[0]);
          }
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

  const colorVariant = useMemo(() => 
    product?.variants.find(v => v.type.toLowerCase() === 'color'), 
  [product]);

  const sizeVariant = useMemo(() =>
    product?.variants.find(v => v.type.toLowerCase() === 'size'),
  [product]);
  
  useEffect(() => {
    if (selectedColor && colorVariant) {
        const colorOption = colorVariant.options.find(opt => opt.value === selectedColor);
        if (colorOption?.image) {
            setActiveImageUrl(colorOption.image);
        } else if (product?.images?.[0]) {
            setActiveImageUrl(product.images[0]);
        }
    } else if (product?.images?.[0]) {
        setActiveImageUrl(product.images[0]);
    }
  }, [selectedColor, colorVariant, product]);

  const handleProductSelect = (selectedProductId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('productId', selectedProductId);
    router.push(`${pathname}?${params.toString()}`);
  }

  const handleMouseDown = (e: React.MouseEvent, element: 'text' | 'image') => {
    e.preventDefault();
    setDraggingElement(element);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleResizeMouseDown = (e: React.MouseEvent, element: 'text' | 'image') => {
    e.preventDefault();
    e.stopPropagation();
    setResizingElement(element);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleRotateMouseDown = (e: React.MouseEvent, element: 'text' | 'image') => {
    e.preventDefault();
    e.stopPropagation();
    setRotatingElement(element);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  }
  
  useEffect(() => {
    const handleMouseUp = () => {
      setDraggingElement(null);
      setResizingElement(null);
      setRotatingElement(null);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      if (draggingElement) {
        if (draggingElement === 'text') {
            const newX = textElement.position.x + dx;
            const newY = textElement.position.y + dy;
            setTextElement(prev => ({ ...prev, position: { x: newX, y: newY }}));
        } else if (draggingElement === 'image' && imageElement.src) {
            const newX = imageElement.position.x + dx;
            const newY = imageElement.position.y + dy;
            setImageElement(prev => ({ ...prev, position: { x: newX, y: newY }}));
        }
      } else if (resizingElement) {
         if (resizingElement === 'text') {
            const newSize = Math.max(12, textElement.fontSize + (dx + dy) * 0.1);
            setTextElement(prev => ({ ...prev, fontSize: newSize }));
        } else if (resizingElement === 'image' && imageElement.src) {
            const newWidth = Math.max(20, imageElement.size.width + dx);
            const newHeight = newWidth / imageElement.aspectRatio;
            setImageElement(prev => ({ ...prev, size: { width: newWidth, height: newHeight }}));
        }
      } else if (rotatingElement) {
        const elementRef = document.getElementById(`${rotatingElement}-element`);
        if (!elementRef) return;
        
        const rect = elementRef.getBoundingClientRect();
        const centerX = rect.left - canvasRect.left + rect.width / 2;
        const centerY = rect.top - canvasRect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - canvasRect.top - centerY, e.clientX - canvasRect.left - centerX);
        const degrees = angle * (180 / Math.PI) + 90; // +90 to offset initial handle position

        if (rotatingElement === 'text') {
            setTextElement(prev => ({...prev, rotation: degrees}));
        } else if (rotatingElement === 'image') {
            setImageElement(prev => ({...prev, rotation: degrees}));
        }
      }
      
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    };
    
    if (draggingElement || resizingElement || rotatingElement) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingElement, resizingElement, rotatingElement, textElement, imageElement]);
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
            const aspectRatio = img.width / img.height;
            setImageElement(prev => ({
                ...initialImageState,
                src: e.target?.result as string,
                aspectRatio: aspectRatio,
                size: { width: 150, height: 150 / aspectRatio }
            }));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageReset = () => {
      setImageElement(prev => ({
        ...initialImageState,
        src: prev.src,
        aspectRatio: prev.aspectRatio,
        size: { width: 150, height: 150 / prev.aspectRatio }
      }));
  }

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
                 <Label>1. Select a Product</Label>
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
               {colorVariant && (
                <div className="space-y-2">
                  <Label>2. Select Color</Label>
                  <Select onValueChange={setSelectedColor} value={selectedColor} disabled={!productId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a color..." />
                    </SelectTrigger>
                    <SelectContent>
                      {colorVariant.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
               )}
               {sizeVariant && (
                <div className="space-y-2">
                  <Label>3. Select Size</Label>
                  <Select onValueChange={setSelectedSize} value={selectedSize} disabled={!productId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a size..." />
                    </SelectTrigger>
                    <SelectContent>
                      {sizeVariant.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
               )}
               <div className="space-y-2 pt-4">
                 <Label>4. Customize</Label>
                 <Input 
                   placeholder="Your Text Here"
                   value={textElement.text}
                   onChange={(e) => setTextElement(prev => ({...prev, text: e.target.value}))}
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
               {imageElement.src && (
                  <Button variant="outline" className="w-full justify-start" onClick={handleImageReset}>
                    <Undo className="mr-2" /> Reset Image
                  </Button>
                )}
               <Button variant="outline" className="w-full justify-start" disabled>
                <Brush className="mr-2" /> Choose Clipart
              </Button>
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
                ) : product && activeImageUrl ? (
                   <>
                    <Image
                      src={activeImageUrl}
                      alt={product.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                      key={activeImageUrl}
                    />
                    {textElement.text && (
                       <div
                          id="text-element"
                          className="absolute p-4 border border-dashed border-transparent hover:border-primary cursor-grab select-none group"
                          style={{ 
                            left: `${textElement.position.x}px`, 
                            top: `${textElement.position.y}px`,
                            fontSize: `${textElement.fontSize}px`,
                            color: '#000000',
                            textShadow: '1px 1px 2px #ffffff',
                            transform: `rotate(${textElement.rotation}deg)`,
                          }}
                          onMouseDown={(e) => handleMouseDown(e, 'text')}
                        >
                          {textElement.text}
                           <div 
                            className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-5 bg-primary rounded-full border-2 border-white cursor-alias opacity-0 group-hover:opacity-100 flex items-center justify-center"
                            onMouseDown={(e) => handleRotateMouseDown(e, 'text')}
                          >
                            <RotateCw className="w-3 h-3 text-white" />
                          </div>
                          <div 
                            className="absolute -right-1 -bottom-1 w-4 h-4 bg-primary rounded-full border-2 border-white cursor-se-resize opacity-0 group-hover:opacity-100"
                            onMouseDown={(e) => handleResizeMouseDown(e, 'text')}
                          />
                        </div>
                    )}
                    {imageElement.src && (
                        <div
                            id="image-element"
                            className="absolute border border-dashed border-transparent hover:border-primary cursor-grab select-none group"
                            style={{
                                left: `${imageElement.position.x}px`,
                                top: `${imageElement.position.y}px`,
                                width: `${imageElement.size.width}px`,
                                height: `${imageElement.size.height}px`,
                                transform: `rotate(${imageElement.rotation}deg)`,
                            }}
                            onMouseDown={(e) => handleMouseDown(e, 'image')}
                        >
                           <Image 
                                src={imageElement.src} 
                                alt="User uploaded design" 
                                layout="fill" 
                                className="object-contain pointer-events-none" 
                            />
                            <div 
                                className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-5 bg-primary rounded-full border-2 border-white cursor-alias opacity-0 group-hover:opacity-100 flex items-center justify-center"
                                onMouseDown={(e) => handleRotateMouseDown(e, 'image')}
                            >
                                <RotateCw className="w-3 h-3 text-white" />
                            </div>
                            <div 
                              className="absolute -right-1 -bottom-1 w-4 h-4 bg-primary rounded-full border-2 border-white cursor-se-resize opacity-0 group-hover:opacity-100"
                              onMouseDown={(e) => handleResizeMouseDown(e, 'image')}
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
