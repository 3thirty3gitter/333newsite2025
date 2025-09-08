

import { getThemeSettings } from '@/lib/settings';
import { PageSection } from '@/lib/types';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { ImageWithTextSection } from '@/components/sections/ImageWithTextSection';
import { FaqSection } from '@/components/sections/FaqSection';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturedProductsSection } from '@/components/sections/FeaturedProductsSection';
import { CollectionsSection } from '@/components/sections/CollectionsSection';


const sectionComponents = {
  'hero': HeroSection,
  'featured-products': FeaturedProductsSection,
  'testimonials': TestimonialsSection,
  'image-with-text': ImageWithTextSection,
  'faq': FaqSection,
  'collections': CollectionsSection,
};

export default async function Home() {
  const settings = await getThemeSettings();
  const homePage = settings.pages?.find(p => p.path === '/');
  const sections = homePage?.sections || [];

  return (
    <div className="flex flex-col">
      {sections.map((section) => {
        const SectionComponent = sectionComponents[section.type];
        return SectionComponent ? <SectionComponent key={section.id} section={section} /> : null;
      })}
    </div>
  );
}
