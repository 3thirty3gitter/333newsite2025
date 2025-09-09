
'use client';

import { PageSection } from "@/lib/types";
import Image from "next/image";
import { Button } from "../ui/button";

export const HeroSection = ({ section }: { section: PageSection }) => {
    const height = section.props.height || 60; // default to 60vh
    
    return (
        <section 
            className="relative w-full flex items-center justify-center text-center bg-primary/10"
            style={{ height: `${height}vh`, minHeight: '400px' }}
        >
            <div className="absolute inset-0">
            {section.props.imageUrl && (
                <Image
                src={section.props.imageUrl}
                alt="Hero background"
                fill
                className="object-cover opacity-20"
                priority
                data-ai-hint="abstract background"
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            </div>
            <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-6">
                <h1 className="text-4xl font-headline font-bold tracking-tighter sm:text-5xl md:text-6xl text-primary-foreground mix-blend-multiply">
                {section.props.title}
                </h1>
                <p className="mx-auto max-w-[700px] text-foreground/80 md:text-xl">
                {section.props.subtitle}
                </p>
                <div>
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <a href={section.props.buttonHref}>{section.props.buttonLabel}</a>
                </Button>
                </div>
            </div>
            </div>
        </section>
    );
}
