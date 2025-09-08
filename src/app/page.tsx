

import { getThemeSettings } from '@/lib/settings';
import { PageSection } from '@/lib/types';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { ImageWithTextSection } from '@/components/sections/ImageWithTextSection';
import { FaqSection } from '@/components/sections/FaqSection';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturedProductsSection } from '@/components/sections/FeaturedProductsSection';


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
