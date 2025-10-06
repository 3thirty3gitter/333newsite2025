
'use client';

import { Suspense, useEffect, useState, useRef, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { createRoot } from 'react-dom/client';
import { getProductById, getProducts } from '@/lib/data';
import type { Product, Variant, DesignViewState, AllDesignsState, TextElement, ImageElement } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Text, Upload, Brush, RotateCw, Undo, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import * as htmlToImage from 'html-to-image';
import { fontMap } from '@/lib/theme';
import { getThemeSettings, type ThemeSettings } from '@/lib/settings';

// This new component is fully self-contained. It manages its own loading and capture.
const CaptureComponent = ({
    baseImageUrl,
    design,
    width,
    height,
    onReady,
}: {
    baseImageUrl: string;
    design: DesignViewState;
    width: number;
    height: number;
    onReady: () => void;
}) => {
    const nodeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const imageSources = [baseImageUrl, ...design.imageElements.map(el => el.src)];
        const imagePromises = imageSources.map(src => {
            return new Promise<void>((resolve, reject) => {
                const img = new window.Image();
                img.crossOrigin = 'anonymous';
                img.src = src;
                img.decode().then(() => resolve()).catch(() => reject(new Error(`Failed to load image: ${src}`)));
            });
        });

        Promise.all(imagePromises)
            .then(() => {
                // Short delay to ensure final rendering after images are decoded
                setTimeout(() => {
                    onReady();
                }, 100);
            })
            .catch(error => {
                console.error("Error loading images for capture:", error);
                // Still call onReady to not hang the process, maybe capture will partially succeed
                onReady();
            });
    }, [baseImageUrl, design, onReady]);

    return (
        <div ref={nodeRef} style={{ position: 'relative', width, height }}>
            <Image
                src={baseImageUrl}
                alt="Product Base"
                fill
                style={{ objectFit: "contain" }}
                crossOrigin="anonymous"
                priority
            />
            {design.imageElements.map((imgEl, index) => (
                <div key={imgEl.id} style={{
                    position: 'absolute',
                    left: `${imgEl.position.x}px`,
                    top: `${imgEl.position.y}px`,
                    width: `${imgEl.size.width}px`,
                    height: `${imgEl.size.height}px`,
                    transform: `rotate(${imgEl.rotation}deg)`,
                    zIndex: index + 1,
                }}>
                    <Image
                        src={imgEl.src}
                        alt=""
                        fill
                        style={{ objectFit: "contain" }}
                        crossOrigin="anonymous"
                    />
                </div>
            ))}
            {design.textElements.map((txtEl, index) => (
                <div key={txtEl.id} style={{
                    position: 'absolute',
                    left: `${txtEl.position.x}px`,
                    top: `${txtEl.position.y}px`,
                    fontSize: `${txtEl.fontSize}px`,
                    color: '#000000',
                    fontFamily: 'var(--font-body)',
                    textShadow: '1px 1px 2px #ffffff',
                    transform: `rotate(${txtEl.rotation}deg)`,
                    zIndex: design.imageElements.length + index + 1,
                    whiteSpace: 'nowrap',
                }}>
                    {txtEl.text}
                </div>
            ))}
        </div>
    );
};


function MockupTool() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImageUrl, setActiveImageUrl] = useState<string>('');

  const [designs, setDesigns] = useState<AllDesignsState>({});

  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
  const [resizingElementId, setResizingElementId] = useState<string | null>(null);
  const [rotatingElementId, setRotatingElementId] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [thumbnailScale, setThumbnailScale] = useState(0.2);

  useEffect(() => {
    async function fetchThemeSettings() {
      const settings = await getThemeSettings();
      setThemeSettings(settings);
    }
    fetchThemeSettings();
  }, []); 

  useEffect(() => {
    const calculateScale = () => {
      if (canvasRef.current && thumbnailContainerRef.current) {
        const canvasWidth = canvasRef.current.offsetWidth;
        const thumbnailWidth = thumbnailContainerRef.current.offsetWidth / 5 - 16; // 5 items, with gap
        if (canvasWidth > 0 && thumbnailWidth > 0) {
            setThumbnailScale(thumbnailWidth / canvasWidth);
        }
      }
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [product]);

  const currentDesign = useMemo(() => {
    if (!activeImageUrl) return { textElements: [], imageElements: [] };
    return designs[activeImageUrl] || { textElements: [], imageElements: [] };
  }, [designs, activeImageUrl]);

  const allDesignElements = useMemo(() => {
      return [...currentDesign.imageElements, ...currentDesign.textElements];
  }, [currentDesign]);

  const updateCurrentDesign = (newDesign: Partial<DesignViewState>) => {
    if (!activeImageUrl) return;
    setDesigns(prev => ({
      ...prev,
      [activeImageUrl]: {
        ...(prev[activeImageUrl] || { textElements: [], imageElements: [] }),
        ...newDesign,
      }
    }));
  };

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
    const newTextElements = currentDesign.textElements.map(el => el.id === id ? { ...el, ...updates as Partial<TextElement> } : el);
    const newImageElements = currentDesign.imageElements.map(el => el.id === id ? { ...el, ...updates as Partial<ImageElement> } : el);
    updateCurrentDesign({ textElements: newTextElements, imageElements: newImageElements });
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

      const elementToUpdate = allDesignElements.find(el => el.id === activeId);
      if (!elementToUpdate) return;

      if (draggingElementId) {
          const newX = elementToUpdate.position.x + dx;
          const newY = elementToUpdate.position.y + dy;
          updateElement(draggingElementId, { position: { x: newX, y: newY } });
      } else if (resizingElementId) {
         if (elementToUpdate.type === 'text') {
            const newSize = Math.max(12, (elementToUpdate as TextElement).fontSize + (dx + dy) * 0.1);
            updateElement(resizingElementId, { fontSize: newSize });
        } else if (elementToUpdate.type === 'image') {
            const newWidth = Math.max(20, (elementToUpdate as ImageElement).size.width + dx);
            const newHeight = newWidth / (elementToUpdate as ImageElement).aspectRatio;
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
  }, [draggingElementId, resizingElementId, rotatingElementId, allDesignElements, updateCurrentDesign]);
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
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
            updateCurrentDesign({ imageElements: [...currentDesign.imageElements, newImage] });
            setIsUploading(false);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      event.target.value = '';
    }
  };
  
  const handleDeleteElement = (id: string) => {
    updateCurrentDesign({
        textElements: currentDesign.textElements.filter(el => el.id !== id),
        imageElements: currentDesign.imageElements.filter(el => el.id !== id)
    });
  };

  const handleAddText = (text: string) => {
    if (!activeImageUrl) return;

    const newTextElement: TextElement = {
        id: `text-${Date.now()}`,
        type: 'text',
        text: text,
        position: { x: 50, y: 50 },
        fontSize: 32,
        rotation: 0,
    };
    updateCurrentDesign({ textElements: [...currentDesign.textElements, newTextElement] });
  };
  
  const handleLayerOrderChange = (id: string, direction: 'up' | 'down') => {
    const allElements = [...currentDesign.imageElements, ...currentDesign.textElements];
    const index = allElements.findIndex(el => el.id === id);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index + 1 : index - 1;
    if (newIndex < 0 || newIndex >= allElements.length) return;
    
    [allElements[index], allElements[newIndex]] = [allElements[newIndex], allElements[index]];
    
    updateCurrentDesign({ 
        imageElements: allElements.filter(el => el.type === 'image') as ImageElement[],
        textElements: allElements.filter(el => el.type === 'text') as TextElement[]
    });
  }

  const handleResetImage = (id: string) => {
      const newImageElements = currentDesign.imageElements.map(el => {
          if (el.id === id) {
              return {
                  ...el,
                  position: { x: 70, y: 70 },
                  size: { width: 150, height: 150 / (el as ImageElement).aspectRatio },
                  rotation: 0,
              }
          }
          return el;
      });
      updateCurrentDesign({ imageElements: newImageElements as ImageElement[] });
  }

  const handleNextStep = async () => {
    if (!product || !selectedSize || !canvasRef.current) {
        toast({
            variant: 'destructive',
            title: 'Missing Selection',
            description: 'Please select a product and a size before proceeding.'
        });
        return;
    }
    
    setIsProcessing(true);
    
    if (!themeSettings) {
        toast({ variant: 'destructive', title: 'Theme not loaded', description: 'Theme settings could not be loaded. Please refresh.' });
        setIsProcessing(false);
        return;
    }
    
    try {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const flattenedImages: { [imageUrl: string]: string } = {};
        const allViews = product.images || [];

        const headlineFont = fontMap[themeSettings.headlineFont] || fontMap['poppins'];
        const bodyFont = fontMap[themeSettings.bodyFont] || fontMap['pt-sans'];
        const fontUrl = `https://fonts.googleapis.com/css2?family=${headlineFont.family.replace(/ /g, '+')}:wght@400;700&family=${bodyFont.family.replace(/ /g, '+')}:wght@400;700&display=swap`;
        const fontCss = await fetch(fontUrl).then(res => res.text()).catch(() => '');

        for (const imageUrl of allViews) {
            const capturePromise = new Promise<string>((resolve, reject) => {
                const designForView = designs[imageUrl] || { textElements: [], imageElements: [] };
                
                const tempNode = document.createElement('div');
                tempNode.style.position = 'fixed';
                tempNode.style.left = '-9999px'; // Render off-screen
                document.body.appendChild(tempNode);
                const root = createRoot(tempNode);

                const onCaptureReady = async () => {
                    if (!tempNode) return;
                    try {
                        const dataUrl = await htmlToImage.toPng(tempNode.firstChild as HTMLElement, {
                            fetchRequestInit: { mode: 'cors', cache: 'no-cache' },
                            pixelRatio: 2,
                            width: canvasRect.width,
                            height: canvasRect.height,
                            fontEmbedCss: fontCss,
                        });
                        resolve(dataUrl);
                    } catch (e) {
                        reject(e);
                    } finally {
                        root.unmount();
                        document.body.removeChild(tempNode);
                    }
                };

                root.render(
                    React.createElement('div', { style: { fontFamily: bodyFont.css } },
                        <CaptureComponent 
                            baseImageUrl={imageUrl} 
                            design={designForView} 
                            width={canvasRect.width}
                            height={canvasRect.height}
                            onReady={onCaptureReady}
                        />
                    )
                );
            });
            flattenedImages[imageUrl] = await capturePromise;
        }

        const designData = {
            productId: product.id,
            selectedSize,
            selectedColor,
            productName: product.name,
            flattenedImages,
        };
        
        localStorage.setItem('customDesign', JSON.stringify(designData));
        router.push('/design/preview');

    } catch (e: any) {
        console.error("Failed during design capture:", e);
        toast({
            variant: "destructive",
            title: "Processing Failed",
            description: e.message || "Could not generate design preview. Please try again.",
            duration: 7000,
        });
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-3xl md:text-4xl font-headline font-bold">Product Mockup Tool</h1>
      </div>
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
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && e.currentTarget.value) {
                       handleAddText(e.currentTarget.value);
                       e.currentTarget.value = '';
                     }
                   }}
                 />
               </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
              <Button variant="outline" className="w-full justify-start" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? <Loader2 className="mr-2 animate-spin" /> : <Upload className="mr-2" />}
                {isUploading ? 'Uploading...' : 'Upload Image'}
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
                {allDesignElements.length > 0 ? (
                    <div className="space-y-2">
                        {[...allDesignElements].reverse().map((el, index) => (
                             <div key={el.id} className="flex items-center gap-2 p-2 border rounded-md">
                                <span className="flex-1 truncate">{el.type === 'text' ? (el as TextElement).text : `Image ${currentDesign.imageElements.findIndex(img => img.id === el.id) + 1}`}</span>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleLayerOrderChange(el.id, 'down')} disabled={index === allDesignElements.length - 1}>
                                    <ArrowDown className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleLayerOrderChange(el.id, 'up')} disabled={index === 0}>
                                    <ArrowUp className="h-4 w-4" />
                                </Button>
                                 {el.type === 'image' && (
                                     <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleResetImage(el.id)}>
                                        <Undo className="h-4 w-4" />
                                    </Button>
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

           <Button size="lg" className="w-full" onClick={handleNextStep} disabled={isProcessing || isUploading}>
            {(isProcessing || isUploading) && <Loader2 className="animate-spin mr-2" />}
             {isProcessing ? 'Processing...' : 'Preview &amp; Finish'} <ArrowRight className="ml-2" />
           </Button>
        </div>

        {/* Right Panel: Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div 
                ref={canvasRef}
                id="design-canvas"
                className="aspect-square w-full bg-muted/50 rounded-lg flex items-center justify-center relative overflow-hidden"
                style={{ 
                    fontFamily: 'var(--font-body)', 
                }}
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
                      style={{objectFit:"contain"}}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                      key={activeImageUrl}
                      crossOrigin="anonymous"
                    />
                    {currentDesign.imageElements.map((imgEl, index) => (
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
                                zIndex: index + 1,
                            }}
                            onMouseDown={(e) => handleMouseDown(e, imgEl.id)}
                        >
                           <Image 
                                src={imgEl.src} 
                                alt="User uploaded design" 
                                fill
                                style={{objectFit:"contain"}}
                                className="pointer-events-none" 
                                crossOrigin="anonymous"
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
                    {currentDesign.textElements.map((txtEl, index) => (
                       <div
                          key={txtEl.id}
                          id={txtEl.id}
                          className="absolute p-4 border border-dashed border-transparent hover:border-primary cursor-grab select-none group whitespace-nowrap"
                          style={{ 
                            left: `${txtEl.position.x}px`, 
                            top: `${txtEl.position.y}px`,
                            fontSize: `${txtEl.fontSize}px`,
                            color: '#000000',
                            textShadow: '1px 1px 2px #ffffff',
                            transform: `rotate(${txtEl.rotation}deg)`,
                            zIndex: currentDesign.imageElements.length + index + 1,
                          }}
                          onMouseDown={(e) => handleMouseDown(e, txtEl.id)}
                        >
                          {txtEl.text}
                           <div 
                            className="absolute -top-6 left-1/2 -translate-x-1/2 w-5 h-5 bg-primary rounded-full border-2 border-white cursor-alias opacity-0 group-hover:opacity-100 flex items-center justify-center"
                            onMouseDown={(e) => handleRotateMouseDown(e, txtEl.id)}
                          >
                            <RotateCw className="w-3 h-3 text-white" />
                          </div>
                          <div 
                            className="absolute -right-1 -bottom-1 w-4 h-4 bg-primary rounded-full border-2 border-white cursor-se-resize opacity-0 group-hover:opacity-100"
                            onMouseDown={(e) => handleResizeMouseDown(e, imgEl.id)}
                          />
                        </div>
                    ))}
                   </>
                ) : null}
              </div>
            </CardContent>
          </Card>
           {product && product.images && product.images.length > 1 && (
                <div className="mt-4" ref={thumbnailContainerRef}>
                    <div className="grid grid-cols-5 gap-4">
                        {product.images.map((image, index) => {
                            const designForThumbnail = designs[image] || { textElements: [], imageElements: [] };
                            return (
                                <div key={index} className="relative">
                                    <button
                                        onClick={() => setActiveImageUrl(image)}
                                        className={cn(
                                        "aspect-square w-full relative overflow-hidden rounded-md border-2 transition-all",
                                        activeImageUrl === image ? "border-primary shadow-md" : "border-transparent hover:border-primary/50"
                                        )}
                                    >
                                        <div className="absolute inset-0 z-0">
                                            <Image
                                                src={image}
                                                alt={`Product view ${index + 1}`}
                                                fill
                                                style={{objectFit:"cover"}}
                                                sizes="10vw"
                                                crossOrigin="anonymous"
                                            />
                                        </div>
                                         <div className="absolute inset-0 z-10 overflow-hidden">
                                            {designForThumbnail.imageElements.map((el) => (
                                                <div key={el.id} className="absolute" style={{
                                                    left: el.position.x * thumbnailScale,
                                                    top: el.position.y * thumbnailScale,
                                                    width: el.size.width * thumbnailScale,
                                                    height: el.size.height * thumbnailScale,
                                                    transform: `rotate(${el.rotation}deg)`,
                                                }}>
                                                    <Image src={el.src} alt="" fill style={{objectFit:"contain"}} className="pointer-events-none" crossOrigin="anonymous" />
                                                </div>
                                            ))}
                                            {designForThumbnail.textElements.map((el) => (
                                                <div key={el.id} className="absolute whitespace-nowrap" style={{
                                                    left: el.position.x * thumbnailScale,
                                                    top: el.position.y * thumbnailScale,
                                                    fontSize: el.fontSize * thumbnailScale,
                                                    color: '#000000',
                                                    textShadow: `0.5px 0.5px 1px #ffffff`,
                                                    transform: `rotate(${el.rotation}deg)`,
                                                }}>
                                                    {el.text}
                                                </div>
                                            ))}
                                        </div>
                                    </button>
                                </div>
                            )
                        })}
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
