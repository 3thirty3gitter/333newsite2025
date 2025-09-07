import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { products } from '@/lib/data';
import { ProductCard } from '@/components/products/ProductCard';
import Link from 'next/link';
import { Package } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative w-full h-[60vh] min-h-[400px] flex items-center justify-center text-center bg-primary/10">
        <div className="absolute inset-0">
          <Image
            src="https://picsum.photos/1920/1080"
            alt="Hero background"
            fill
            className="object-cover opacity-20"
            priority
            data-ai-hint="abstract background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid gap-6">
            <h1 className="text-4xl font-headline font-bold tracking-tighter sm:text-5xl md:text-6xl text-primary-foreground mix-blend-multiply">
              Welcome to CommerceCraft
            </h1>
            <p className="mx-auto max-w-[700px] text-foreground/80 md:text-xl">
              Discover a new era of online shopping. Quality products, seamless experience.
            </p>
            <div>
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <a href="#products">Shop Now</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">New Arrivals</div>
            <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl">Featured Products</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Check out our latest collection of hand-picked items.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {products.length > 8 && (
            <div className="mt-12 text-center">
              <Button variant="outline" asChild>
                <Link href="/products">
                  <Package className="mr-2" />
                  View All Products
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
