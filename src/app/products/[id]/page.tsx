'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProductById, getProducts } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartProvider';
import { useHistory } from '@/context/HistoryProvider';
import { ShoppingCart, Star } from 'lucide-react';
import { ProductRecommendations } from '@/components/products/ProductRecommendations';
import { Separator } from '@/components/ui/separator';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

type ProductPageProps = {
  params: {
    id: string;
  };
};

export default function ProductPage({ params }: ProductPageProps) {
  const { addToCart } = useCart();
  const { addToHistory } = useHistory();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      const fetchedProduct = await getProductById(params.id);
      if (fetchedProduct) {
        setProduct(fetchedProduct);
        addToHistory(fetchedProduct.id);
      } else {
        notFound();
      }
      setLoading(false);
    }
    fetchProduct();
  }, [params.id, addToHistory]);

  if (loading) {
    return (
       <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <Skeleton className="aspect-square w-full rounded-lg" />
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
        <div className="aspect-square w-full relative overflow-hidden rounded-lg shadow-lg">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            data-ai-hint="product image"
          />
        </div>
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
          
          <div className="mt-auto pt-6">
            <Button size="lg" className="w-full" onClick={() => addToCart(product)}>
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
