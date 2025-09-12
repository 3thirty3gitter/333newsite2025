
'use client';

import { PageSection } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";

export const ImageWithTextSection = ({ section }: { section: PageSection }) => {
    const { title, text, imageUrl, buttonLabel, buttonHref, imagePosition } = section.props;
    
    return (
        <section className="bg-background w-full">
            <div className="container grid items-center gap-8 px-4 md:px-6 lg:grid-cols-2 lg:gap-16">
                <div className={cn("relative aspect-video overflow-hidden rounded-xl", imagePosition === 'right' && 'lg:order-last')}>
                     {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={title || 'Image with text background'}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            data-ai-hint="lifestyle product"
                        />
                     ) : (
                        <div className="bg-muted w-full h-full flex items-center justify-center">
                            <p className="text-muted-foreground">Placeholder Image</p>
                        </div>
                     )}
                </div>
                <div className="space-y-4">
                    <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-4xl md:text-5xl">{title}</h2>
                    <p className="text-muted-foreground md:text-xl/relaxed">
                        {text}
                    </p>
                    {buttonLabel && buttonHref && (
                        <Button asChild size="lg" className="mt-4">
                            <Link href={buttonHref}>{buttonLabel}</Link>
                        </Button>
                    )}
                </div>
            </div>
        </section>
    )
}
