
'use client';

import { Suspense, useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { getProductById, getProducts } from '@/lib/data';
import type { Product, Variant } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Text, Upload, Brush, RotateCw, Undo, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type DesignElement = {
    id: string;
    type: 'text' | 'image';
    rotation: number;
    position: { x: number, y: number };
}

type TextElement = DesignElement & {
    type: 'text';
    text: string;
    fontSize: number;
};

type ImageElement = DesignElement & {
    type: 'image';
    src: string;
    size: { width: number, height: number };
    aspectRatio: number;
};

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

  const [textElement, setTextElement] = useState<TextElement>({
    id: 'text-element',
    type: 'text',
    text: '',
    position: { x: 50, y: 50 },
    fontSize: 32,
    rotation: 0,
  });

  const [imageElements, setImageElements] = useState<ImageElement[]>([]);
  
  const designElements: (TextElement | ImageElement)[] = useMemo(() => {
    const elements: (TextElement | ImageElement)[] = [...imageElements];
    if (textElement.text) {
        elements.push(textElement);
    }
    return elements;
  }, [imageElements, textElement]);


  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
  const [resizingElementId, setResizingElementId] = useState<string | null>(null);
  const [rotatingElementId, setRotatingElementId] = useState<string | null>(null);
  
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
    product?.variants.find(v => v.type.toLowerCase().includes('color')), 
  [product]);

  const sizeVariant = useMemo(() =>
    product?.variants.find(v => v.type.toLowerCase().includes('size')),
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

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    setDraggingElementId(elementId);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleResizeMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingElementId(elementId);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleRotateMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setRotatingElementId(elementId);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  }

  const updateElement = (id: string, updates: Partial<TextElement | ImageElement>) => {
    if (id === 'text-element') {
        setTextElement(prev => ({ ...prev, ...updates as Partial<TextElement> }));
    } else {
        setImageElements(prev => prev.map(el => el.id === id ? { ...el, ...updates as Partial<ImageElement> } : el));
    }
  }
  
  useEffect(() => {
    const handleMouseUp = () => {
      setDraggingElementId(null);
      setResizingElementId(null);
      setRotatingElementId(null);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      const activeId = draggingElementId || resizingElementId || rotatingElementId;
      if (!activeId) return;

      const elementToUpdate = designElements.find(el => el.id === activeId);
      if (!elementToUpdate) return;

      if (draggingElementId) {
          const newX = elementToUpdate.position.x + dx;
          const newY = elementToUpdate.position.y + dy;
          updateElement(draggingElementId, { position: { x: newX, y: newY } });
      } else if (resizingElementId) {
         if (resizingElementId === 'text-element' && elementToUpdate.type === 'text') {
            const newSize = Math.max(12, elementToUpdate.fontSize + (dx + dy) * 0.1);
            updateElement(resizingElementId, { fontSize: newSize });
        } else if (elementToUpdate.type === 'image') {
            const newWidth = Math.max(20, elementToUpdate.size.width + dx);
            const newHeight = newWidth / elementToUpdate.aspectRatio;
            updateElement(resizingElementId, { size: { width: newWidth, height: newHeight } });
        }
      } else if (rotatingElementId) {
        const elementRef = document.getElementById(rotatingElementId);
        if (!elementRef) return;
        
        const rect = elementRef.getBoundingClientRect();
        const centerX = rect.left - canvasRect.left + rect.width / 2;
        const centerY = rect.top - canvasRect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - canvasRect.top - centerY, e.clientX - canvasRect.left - centerX);
        const degrees = angle * (180 / Math.PI) + 90; // +90 to offset initial handle position

        updateElement(rotatingElementId, { rotation: degrees });
      }
      
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    };
    
    if (draggingElementId || resizingElementId || rotatingElementId) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingElementId, resizingElementId, rotatingElementId, designElements]);
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
            const aspectRatio = img.width / img.height;
            const newImage: ImageElement = {
                id: `image-${Date.now()}`,
                type: 'image',
                src: e.target?.result as string,
                position: { x: 70, y: 70 },
                size: { width: 150, height: 150 / aspectRatio },
                aspectRatio,
                rotation: 0
            };
            setImageElements(prev => [...prev, newImage]);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleDeleteElement = (id: string) => {
    if (id === 'text-element') {
        setTextElement(prev => ({ ...prev, text: '' }));
    } else {
        setImageElements(prev => prev.filter(el => el.id !== id));
    }
  };
  
  const handleLayerOrderChange = (id: string, direction: 'up' | 'down') => {
    if (id === 'text-element') return; // Cannot reorder text element for now
    setImageElements(prev => {
        const index = prev.findIndex(el => el.id === id);
        if (index === -1) return prev;

        const newIndex = direction === 'up' ? index + 1 : index - 1;
        if (newIndex < 0 || newIndex >= prev.length) return prev;

        const newArray = [...prev];
        const temp = newArray[index];
        newArray[index] = newArray[newIndex];
        newArray[newIndex] = temp;
        
        return newArray;
    });
  }

  const handleResetImage = (id: string) => {
      setImageElements(prev => prev.map(el => {
          if (el.id === id) {
              return {
                  ...el,
                  position: { x: 70, y: 70 },
                  size: { width: 150, height: 150 / el.aspectRatio },
                  rotation: 0,
              }
          }
          return el;
      }));
  }


  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
      <h1 className="text-3xl md:text-4xl font-headline font-bold mb-8">Product Mockup Tool</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 space-y-8">
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
               <Button variant="outline" className="w-full justify-start" disabled>
                <Brush className="mr-2" /> Choose Clipart
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
                <CardTitle>Layers</CardTitle>
                <CardDescription>Manage your design elements</CardDescription>
            </CardHeader>
            <CardContent>
                {designElements.length > 0 ? (
                    <div className="space-y-2">
                        {designElements.map((el, index) => (
                             <div key={el.id} className="flex items-center gap-2 p-2 border rounded-md">
                                <span className="flex-1 truncate">{el.type === 'text' ? el.text : `Image ${imageElements.findIndex(img => img.id === el.id) + 1}`}</span>
                                {el.type === 'image' && (
                                    <>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleLayerOrderChange(el.id, 'down')} disabled={index === 0}>
                                            <ArrowDown className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleLayerOrderChange(el.id, 'up')} disabled={index === imageElements.length - 1}>
                                            <ArrowUp className="h-4 w-4" />
                                        </Button>
                                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleResetImage(el.id)}>
                                            <Undo className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteElement(el.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center">Add text or an image to start designing.</p>
                )}
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
                    {imageElements.map((imgEl) => (
                        <div
                            key={imgEl.id}
                            id={imgEl.id}
                            className="absolute border border-dashed border-transparent hover:border-primary cursor-grab select-none group"
                            style={{
                                left: `${imgEl.position.x}px`,
                                top: `${imgEl.position.y}px`,
                                width: `${imgEl.size.width}px`,
                                height: `${imgEl.size.height}px`,
                                transform: `rotate(${imgEl.rotation}deg)`,
                                zIndex: imageElements.findIndex(el => el.id === imgEl.id) + 1, // Basic layering
                            }}
                            onMouseDown={(e) => handleMouseDown(e, imgEl.id)}
                        >
                           <Image 
                                src={imgEl.src} 
                                alt="User uploaded design" 
                                layout="fill" 
                                className="object-contain pointer-events-none" 
                            />
                            <div 
                                className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-5 bg-primary rounded-full border-2 border-white cursor-alias opacity-0 group-hover:opacity-100 flex items-center justify-center"
                                onMouseDown={(e) => handleRotateMouseDown(e, imgEl.id)}
                            >
                                <RotateCw className="w-3 h-3 text-white" />
                            </div>
                            <div 
                              className="absolute -right-1 -bottom-1 w-4 h-4 bg-primary rounded-full border-2 border-white cursor-se-resize opacity-0 group-hover:opacity-100"
                              onMouseDown={(e) => handleResizeMouseDown(e, imgEl.id)}
                            />
                        </div>
                    ))}
                    {textElement.text && (
                       <div
                          id={textElement.id}
                          className="absolute p-4 border border-dashed border-transparent hover:border-primary cursor-grab select-none group"
                          style={{ 
                            left: `${textElement.position.x}px`, 
                            top: `${textElement.position.y}px`,
                            fontSize: `${textElement.fontSize}px`,
                            color: '#000000',
                            textShadow: '1px 1px 2px #ffffff',
                            transform: `rotate(${textElement.rotation}deg)`,
                            zIndex: imageElements.length + 2, // Text always on top
                          }}
                          onMouseDown={(e) => handleMouseDown(e, textElement.id)}
                        >
                          {textElement.text}
                           <div 
                            className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-5 bg-primary rounded-full border-2 border-white cursor-alias opacity-0 group-hover:opacity-100 flex items-center justify-center"
                            onMouseDown={(e) => handleRotateMouseDown(e, textElement.id)}
                          >
                            <RotateCw className="w-3 h-3 text-white" />
                          </div>
                          <div 
                            className="absolute -right-1 -bottom-1 w-4 h-4 bg-primary rounded-full border-2 border-white cursor-se-resize opacity-0 group-hover:opacity-100"
                            onMouseDown={(e) => handleResizeMouseDown(e, textElement.id)}
                          />
                        </div>
                    )}
                   </>
                ) : null}
              </div>
            </CardContent>
          </Card>
           {product && product.images && product.images.length > 1 && (
                <div className="mt-4">
                    <div className="grid grid-cols-5 gap-4">
                        {product.images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveImageUrl(image)}
                                className={cn(
                                "aspect-square relative overflow-hidden rounded-md border-2 transition-all",
                                activeImageUrl === image ? "border-primary shadow-md" : "border-transparent hover:border-primary/50"
                                )}
                            >
                                <Image
                                src={image}
                                alt={`Product view ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="10vw"
                                />
                            </button>
                        ))}
                    </div>
                </div>
           )}
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

    