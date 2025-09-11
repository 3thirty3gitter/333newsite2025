
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { getProductBySlug, getProductById } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartProvider';
import { useHistory } from '@/context/HistoryProvider';
import { ShoppingCart, Star, Pencil } from 'lucide-react';
import { ProductRecommendations } from '@/components/products/ProductRecommendations';
import { Separator } from '@/components/ui/separator';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductImageGallery } from '@/components/products/ProductImageGallery';
import Link from 'next/link';

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { addToCart } = useCart();
  const { addToHistory } = useHistory();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      if (!slug) return;

      let fetchedProduct = await getProductBySlug(slug);
      
      // Fallback for old products that might not have a handle/slug
      // and are being accessed by ID via a redirect or old link.
      if (!fetchedProduct) {
        fetchedProduct = await getProductById(slug);
      }

      if (fetchedProduct) {
        if (fetchedProduct.status === 'active') {
            setProduct(fetchedProduct);
            addToHistory(fetchedProduct.id);
        } else {
            notFound();
        }
      } else {
        notFound();
      }
      setLoading(false);
    }
    fetchProduct();
  }, [slug, addToHistory]);

  if (loading) {
    return (
       <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="mt-4 grid grid-cols-5 gap-4">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="aspect-square w-full rounded-lg" />
            </div>
          </div>
          <div className="flex flex-col space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <div className="mt-auto pt-6">
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <ProductImageGallery images={product.images} />
        <div className="flex flex-col">
          <div className="mb-2">
            <span className="text-sm font-medium text-primary bg-primary/10 py-1 px-3 rounded-full">
              {product.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold">{product.name}</h1>
          <div className="flex items-center gap-2 mt-2 mb-4">
            <div className="flex text-accent">
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-muted stroke-accent" />
            </div>
            <span className="text-sm text-muted-foreground">(123 reviews)</span>
          </div>
          <p className="text-3xl font-bold text-primary mb-6">${product.price.toFixed(2)}</p>
          <p className="text-muted-foreground leading-relaxed">{product.longDescription}</p>
          
          <div className="mt-auto pt-6 space-y-4">
            <Button size="lg" className="w-full" asChild>
                <Link href={`/design?productId=${product.id}`}>
                    <Pencil className="mr-2" />
                    Design Your Own
                </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full" onClick={() => addToCart(product)}>
              <ShoppingCart className="mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
      <Separator className="my-12" />
      <ProductRecommendations currentProductId={product.id} />
    </div>
  );
}
