

import { notFound } from 'next/navigation';
import { getThemeSettings } from '@/lib/settings';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { ImageWithTextSection } from '@/components/sections/ImageWithTextSection';
import { FaqSection } from '@/components/sections/FaqSection';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturedProductsSection } from '@/components/sections/FeaturedProductsSection';
import { CollectionsSection } from '@/components/sections/CollectionsSection';

type PageProps = {
  params: {
    slug: string;
  };
};

const sectionComponents = {
  'hero': HeroSection,
  'featured-products': FeaturedProductsSection,
  'testimonials': TestimonialsSection,
  'image-with-text': ImageWithTextSection,
  'faq': FaqSection,
  'collections': CollectionsSection,
};

export default async function Page({ params }: PageProps) {
  const settings = await getThemeSettings();
  const pageData = settings.pages?.find(p => p.path === `/${params.slug}`);

  if (!pageData) {
    notFound();
  }

  const sections = pageData.sections || [];

  return (
    <div className="flex flex-col">
      {sections.map((section) => {
        const SectionComponent = sectionComponents[section.type];
        return SectionComponent ? <SectionComponent key={section.id} section={section} /> : null;
      })}
       {sections.length === 0 && (
        <div className="container text-center py-24">
          <h1 className="text-4xl font-bold mb-4">{pageData.name}</h1>
          <p className="text-muted-foreground">This page is empty. Add sections in the website editor.</p>
        </div>
      )}
    </div>
  );
}
