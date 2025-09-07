'use client';

import { useState, useEffect } from 'react';
import { useHistory } from '@/context/HistoryProvider';
import { getProductRecommendations } from '@/ai/flows/product-recommendations';
import { products } from '@/lib/data';
import type { Product } from '@/lib/types';
import { ProductCard } from './ProductCard';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Skeleton } from '../ui/skeleton';

interface ProductRecommendationsProps {
  currentProductId: string;
}

export function ProductRecommendations({ currentProductId }: ProductRecommendationsProps) {
  const { viewingHistory } = useHistory();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      if (viewingHistory.length > 0) {
        setIsLoading(true);
        try {
          const result = await getProductRecommendations({ viewingHistory });
          const recommendedProducts = products.filter(p => 
            result.recommendedProducts.includes(p.id) && p.id !== currentProductId
          );
          setRecommendations(recommendedProducts.slice(0, 6)); // Limit to 6 recommendations
        } catch (error) {
          console.error("Failed to fetch recommendations:", error);
          setRecommendations([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }
    fetchRecommendations();
  }, [viewingHistory, currentProductId]);
  
  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-headline font-bold mb-6">You Might Also Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[250px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-headline font-bold mb-6">You Might Also Like</h2>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {recommendations.map((product) => (
            <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
              <div className="p-1 h-full">
                <ProductCard product={product} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
