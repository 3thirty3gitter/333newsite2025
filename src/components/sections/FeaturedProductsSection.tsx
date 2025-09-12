
'use client';

import { getProducts } from '@/lib/data';
import { ProductCard } from '@/components/products/ProductCard';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Package } from 'lucide-react';
import type { PageSection, Product } from '@/lib/types';
import { useEffect, useState } from 'react';

type FeaturedProductsSectionProps = {
  section: PageSection;
  products?: Product[]; // Optional products prop
};

export const FeaturedProductsSection = ({ section, products: initialProducts }: FeaturedProductsSectionProps) => {
  const [allProducts, setAllProducts] = useState<Product[]>(initialProducts || []);
  const [isLoading, setIsLoading] = useState(!initialProducts);

  useEffect(() => {
    // If products are not passed as a prop, fetch them on the client.
    // This is useful for the live preview in the editor.
    if (!initialProducts) {
      setIsLoading(true);
      getProducts()
        .then(setAllProducts)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [initialProducts]);

  const { title, subtitle, productIds = [] } = section.props;

  const featuredProducts = productIds
      .map((id: string) => allProducts.find(p => p.id === id))
      .filter((p: Product | undefined): p is Product => !!p);

  if (isLoading) {
    return (
      <section className="w-full">
        <div className="container px-4 md:px-6 text-center">
          <p>Loading products...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="w-full">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">New Arrivals</div>
          <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl">{title}</h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            {subtitle}
          </p>
        </div>
        
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 justify-center">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No products selected for this section yet.</p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Button variant="outline" asChild>
            <Link href="/products">
              <Package className="mr-2" />
              View All Products
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
