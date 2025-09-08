'use server';

/**
 * @fileOverview A flow for generating e-commerce collection descriptions.
 *
 * - generateCollectionDescription - A function that generates a description for a collection.
 * - GenerateCollectionDescriptionInput - The input type for the generateCollectionDescription function.
 * - GenerateCollectionDescriptionOutput - The return type for the generateCollectionDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCollectionDescriptionInputSchema = z.object({
  collectionName: z.string().describe('The name of the collection.'),
});
export type GenerateCollectionDescriptionInput = z.infer<typeof GenerateCollectionDescriptionInputSchema>;

const GenerateCollectionDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated description for the collection.'),
});
export type GenerateCollectionDescriptionOutput = z.infer<typeof GenerateCollectionDescriptionOutputSchema>;

export async function generateCollectionDescription(input: GenerateCollectionDescriptionInput): Promise<GenerateCollectionDescriptionOutput> {
  return generateCollectionDescriptionFlow(input);
}

const generateCollectionDescriptionPrompt = ai.definePrompt({
  name: 'generateCollectionDescriptionPrompt',
  input: {schema: GenerateCollectionDescriptionInputSchema},
  output: {schema: GenerateCollectionDescriptionOutputSchema},
  prompt: `You are a marketing expert for an e-commerce website. 
  
  Your task is to write a short, compelling description for a product collection. 
  
  The description should be engaging and make the user want to explore the products within that collection.

  Collection Name: {{{collectionName}}}
  
  Generate a description based on this name.`,
});

const generateCollectionDescriptionFlow = ai.defineFlow(
  {
    name: 'generateCollectionDescriptionFlow',
    inputSchema: GenerateCollectionDescriptionInputSchema,
    outputSchema: GenerateCollectionDescriptionOutputSchema,
  },
  async input => {
    const {output} = await generateCollectionDescriptionPrompt(input);
    return output!;
  }
);
