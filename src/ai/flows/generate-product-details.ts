'use server';

/**
 * @fileOverview A flow for generating product details like descriptions and SEO content.
 *
 * - generateProductDetails - Generates content based on a product name.
 * - GenerateProductDetailsInput - Input schema for the flow.
 * - GenerateProductDetailsOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateProductDetailsInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
});
export type GenerateProductDetailsInput = z.infer<typeof GenerateProductDetailsInputSchema>;

const GenerateProductDetailsOutputSchema = z.object({
    description: z.string().describe('A short, catchy marketing description for the product.'),
    longDescription: z.string().describe('A detailed, informative description of the product, highlighting its features and benefits.'),
    seoTitle: z.string().describe('An SEO-friendly title for the product page, under 60 characters.'),
    seoDescription: z.string().describe('An SEO-friendly meta description for the product page, under 160 characters.'),
});
export type GenerateProductDetailsOutput = z.infer<typeof GenerateProductDetailsOutputSchema>;

const generateProductDetailsPrompt = ai.definePrompt({
    name: 'generateProductDetailsPrompt',
    input: { schema: GenerateProductDetailsInputSchema },
    output: { schema: GenerateProductDetailsOutputSchema },
    prompt: `You are an expert e-commerce copywriter and SEO specialist. 
    
    Your task is to generate compelling marketing and SEO content for a product.

    The product name is: "{{productName}}".

    Based on the product name, please generate the following:
    1.  A short, catchy marketing description.
    2.  A detailed, informative full description highlighting potential features and benefits.
    3.  An SEO-friendly title (less than 60 characters).
    4.  An SEO-friendly meta description (less than 160 characters).
    `,
});

const generateProductDetailsFlow = ai.defineFlow(
  {
    name: 'generateProductDetailsFlow',
    inputSchema: GenerateProductDetailsInputSchema,
    outputSchema: GenerateProductDetailsOutputSchema,
  },
  async (input) => {
    const { output } = await generateProductDetailsPrompt(input);
    return output!;
  }
);


export async function generateProductDetails(input: GenerateProductDetailsInput): Promise<GenerateProductDetailsOutput> {
  return generateProductDetailsFlow(input);
}
