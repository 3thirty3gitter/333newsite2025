
'use client';

import { PageSection } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Star } from "lucide-react";

type Testimonial = {
    name: string;
    title: string;
    quote: string;
    avatarUrl: string;
}

export const TestimonialsSection = ({ section }: { section: PageSection }) => {
    const { title, subtitle, testimonials = [] } = section.props;
    
    return (
        <section className="bg-muted/50 w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-3xl font-headline font-bold tracking-tighter sm:text-5xl">{title}</h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        {subtitle}
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial: Testimonial, index: number) => (
                        <Card key={index} className="flex flex-col">
                            <CardContent className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex text-accent mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 fill-current" />
                                        ))}
                                    </div>
                                    <p className="text-muted-foreground mb-6">"{testimonial.quote}"</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={testimonial.avatarUrl} alt={testimonial.name} data-ai-hint="person face" />
                                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{testimonial.name}</p>
                                        <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
