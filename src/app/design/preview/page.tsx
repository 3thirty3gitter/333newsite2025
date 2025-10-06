
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCart } from '@/context/CartProvider';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import { getProductById } from '@/lib/data';
import type { Product } from '@/lib/types';

type DesignData = {
    productId: string;
    selectedSize: string;
    selectedColor: string;
    productName: string;
    flattenedImages: { [originalUrl: string]: string };
};

function PreviewPage() {
    const router = useRouter();
    const { addToCart } = useCart();
    const { toast } = useToast();
    const [design, setDesign] = useState<DesignData | null>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [agreed, setAgreed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const savedDesign = localStorage.getItem('customDesign');
            if (savedDesign) {
                const parsedDesign: DesignData = JSON.parse(savedDesign);
                setDesign(parsedDesign);

                getProductById(parsedDesign.productId)
                    .then(p => {
                        if (p) setProduct(p)
                        else setError('Product information could not be loaded.');
                    })
                    .catch(() => setError('Failed to fetch product details.'))
                    .finally(() => setIsLoading(false));
                
            } else {
                setError('No design found. Please go back and create a design.');
                setIsLoading(false);
            }
        } catch (e) {
            setError('Could not load your design. It might be invalid.');
            setIsLoading(false);
        }
    }, []);
    

    const handleAddToCart = () => {
        if (product && design) {
            // For a custom product, you might have different logic for price
            // or generate a unique composite image.
            // For now, we use the base product's info and first design image.
            const representativeImage = Object.values(design.flattenedImages)[0] || product.images[0];

            addToCart({
                product: product,
                price: product.price, // Or a custom price
                image: representativeImage,
                variantLabel: `Custom - ${design.selectedSize}${design.selectedColor ? ` / ${design.selectedColor}` : ''}`
            });
            toast({
                title: "Custom Product Added!",
                description: `${product.name} (${design?.selectedSize} / ${design?.selectedColor}) has been added to your cart.`
            });
            router.push('/cart');
        }
    };
    
    if (isLoading) {
        return <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12"><Skeleton className="w-full h-[600px]" /></div>
    }

    if (error || !design || !product) {
        return (
            <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12 text-center">
                <h2 className="text-2xl font-bold text-destructive mb-4">An Error Occurred</h2>
                <p className="text-muted-foreground mb-6">{error || 'Could not load the design preview.'}</p>
                 <Button onClick={() => router.back()}>
                    <ArrowLeft className="mr-2" /> Go Back
                </Button>
            </div>
        )
    }

    const designedImageUrls = Object.values(design.flattenedImages);

    return (
        <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft />
                    <span className="sr-only">Back to Editor</span>
                </Button>
                <h1 className="text-3xl md:text-4xl font-headline font-bold">Preview Your Design</h1>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                     {designedImageUrls.length > 0 ? (
                        <div className="space-y-8">
                            {designedImageUrls.map((imgUrl, index) => (
                                <Card key={index}>
                                    <CardContent className="p-4">
                                        <div className="aspect-square w-full bg-muted/50 rounded-lg flex items-center justify-center relative overflow-hidden">
                                             <Image src={imgUrl} alt={`Final Design Preview ${index + 1}`} fill style={{objectFit:"contain"}} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                     ) : (
                         <p className="text-muted-foreground">You haven't added any design elements yet. Go back to add some!</p>
                     )}
                </div>

                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>{design.productName}</CardTitle>
                            <CardDescription>
                                {design.selectedSize}
                                {design.selectedColor && ` / ${design.selectedColor}`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="font-bold text-2xl">${product.price.toFixed(2)}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Terms & Conditions</CardTitle>
                            <CardDescription>Please read and agree before adding to cart.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="h-32 overflow-y-auto p-3 border rounded-md text-sm text-muted-foreground">
                                <p>By adding this custom product to your cart, you agree to the following terms:</p>
                                <ul className="list-disc list-inside my-2 space-y-1">
                                    <li>You confirm that you own the rights to all images and assets you have uploaded, or that you have the necessary licenses to use them.</li>
                                    <li>You understand that you are solely responsible for any copyright infringement claims related to the content you have provided.</li>
                                    <li>3thirty3 (the website owner) is not liable for any unauthorized use of copyrighted materials in your design.</li>
                                    <li>You grant 3thirty3 a license to use your design for the sole purpose of manufacturing and delivering your product.</li>
                                </ul>
                                <p>Customized products are non-refundable except in the case of a manufacturing defect.</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} />
                                <Label htmlFor="terms" className="leading-snug">
                                    I have read and agree to the terms and conditions. I confirm I have the rights to use all uploaded content.
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    <Button size="lg" className="w-full" disabled={!agreed} onClick={handleAddToCart}>
                        Add to Cart
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function PreviewPageWrapper() {
    return (
        <Suspense fallback={<div>Loading Preview...</div>}>
            <PreviewPage />
        </Suspense>
    );
}
