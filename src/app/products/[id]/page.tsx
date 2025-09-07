'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { products } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartProvider';
import { useHistory } from '@/context/HistoryProvider';
import { ShoppingCart, Star } from 'lucide-react';
import { ProductRecommendations } from '@/components/products/ProductRecommendations';
import { Separator } from '@/components/ui/separator';

type ProductPageProps = {
  params: {
    id: string;
  };
};

export default function ProductPage({ params }: ProductPageProps) {
  const { addToCart } = useCart();
  const { addToHistory } = useHistory();
  const product = products.find((p) => p.id === params.id);

  useEffect(() => {
    if (product) {
      addToHistory(product.id);
    }
  }, [product, addToHistory]);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="aspect-square w-full relative overflow-hidden rounded-lg shadow-lg">
          <Image
            src={product.image}
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
