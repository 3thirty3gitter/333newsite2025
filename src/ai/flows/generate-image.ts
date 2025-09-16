'use server';

/**
 * @fileOverview A flow for generating images from a text prompt.
 *
 * - generateImage - A function that generates an image.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate the image from.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

const styleGuide = `
- Primary color: Deep blue (#3F51B5) to evoke trust and stability.
- Background color: Very light blue (#E8EAF6) to maintain a clean and calm backdrop.
- Accent color: Vibrant orange (#FF9800) for calls to action and important highlights.
- Headline font: \'Poppins\' (sans-serif), providing a balance of modern precision with legibility, ideal for headlines and short content blocks.
- Body font: \'PT Sans\' (sans-serif), ensuring readability and approachability for product descriptions and other body text.
- Use clean, outline-style icons for navigation and product categories.
- Subtle transitions and loading animations to provide a smooth user experience.
`;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: `Apply the following style guide: ${styleGuide}. A high-quality, professional e-commerce product photo for a custom printing business: ${input.prompt}`,
    });
    
    if (!media.url) {
        throw new Error('Image generation failed to return a URL.');
    }

    return { imageUrl: media.url };
  }
);
