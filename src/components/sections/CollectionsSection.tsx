
'use client';

import { getCollections } from '@/lib/data';
import { Button } from '../ui/button';
import type { Collection, PageSection } from '@/lib/types';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '../ui/card';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

type CollectionsSectionProps = {
  section: PageSection;
  collections?: Collection[]; // Optional collections prop
};

export const CollectionsSection = ({ section, collections: initialCollections }: CollectionsSectionProps) => {
  const [collections, setCollections] = useState<Collection[]>(initialCollections || []);
  const [isLoading, setIsLoading] = useState(!initialCollections);

  useEffect(() => {
    if (!initialCollections) {
      setIsLoading(true);
      getCollections()
        .then(setCollections)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [initialCollections]);

  if (isLoading) {
    return (
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 justify-center">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full" />
                ))}
            </div>
        </div>
      </section>
    );
  }

  return (
    <section id="collections" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl">{section.props.title}</h2>
          <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            {section.props.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 justify-center">
          {collections.map((collection) => (
            <Link key={collection.id} href={`/collections/${collection.name.toLowerCase().replace(/ /g, '-')}`} className="block group">
                <Card className="overflow-hidden h-full transition-all hover:shadow-lg hover:-translate-y-1">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full min-h-[150px]">
                        <h3 className="text-xl font-headline font-semibold mb-2">{collection.name}</h3>
                        <p className="text-sm text-primary flex items-center gap-2">
                            Shop Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </p>
                    </CardContent>
                </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
