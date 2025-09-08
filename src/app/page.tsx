

import { getProducts } from '@/lib/data';
import { ProductCard } from '@/components/products/ProductCard';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { getThemeSettings } from '@/lib/settings';
import { PageSection } from '@/lib/types';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { ImageWithTextSection } from '@/components/sections/ImageWithTextSection';
import { FaqSection } from '@/components/sections/FaqSection';
import { HeroSection } from '@/components/sections/HeroSection';

const FeaturedProductsSection = async ({ section }: { section: PageSection }) => {
  const products = await getProducts();
  const productCount = section.props.count || 8;

  return (
    <section id="products" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">New Arrivals</div>
          <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl">{section.props.title}</h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            {section.props.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {products.slice(0, productCount).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {products.length > productCount && (
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
  );
};


const sectionComponents = {
  'hero': HeroSection,
  'featured-products': FeaturedProductsSection,
  'testimonials': TestimonialsSection,
  'image-with-text': ImageWithTextSection,
  'faq': FaqSection,
};

export default async function Home() {
  const settings = await getThemeSettings();
  const sections = settings.sections || [];

  return (
    <div className="flex flex-col">
      {sections.map((section) => {
        const SectionComponent = sectionComponents[section.type];
        return SectionComponent ? <SectionComponent key={section.id} section={section} /> : null;
      })}
    </div>
  );
}
