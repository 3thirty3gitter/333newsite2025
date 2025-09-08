'use server';

/**
 * @fileOverview A flow for generating SEO-friendly filenames from a text string.
 *
 * - generateFilename - A function that generates a filename.
 * - GenerateFilenameInput - The input type for the generateFilename function.
 * - GenerateFilenameOutput - The return type for the generateFilename function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFilenameInputSchema = z.object({
  context: z.string().describe('The text context to generate the filename from (e.g., product name, prompt).'),
});
export type GenerateFilenameInput = z.infer<typeof GenerateFilenameInputSchema>;

const GenerateFilenameOutputSchema = z.object({
  filename: z.string().describe('The generated SEO-friendly filename, ending in .jpg'),
});
export type GenerateFilenameOutput = z.infer<typeof GenerateFilenameOutputSchema>;

export async function generateFilename(input: GenerateFilenameInput): Promise<GenerateFilenameOutput> {
  return generateFilenameFlow(input);
}

const generateFilenamePrompt = ai.definePrompt({
  name: 'generateFilenamePrompt',
  input: {schema: GenerateFilenameInputSchema},
  output: {schema: GenerateFilenameOutputSchema},
  prompt: `You are an SEO expert. Your task is to convert a given text string into a URL-safe, SEO-friendly filename.

  Follow these rules:
  1. Make the filename lowercase.
  2. Replace spaces and special characters with hyphens (-).
  3. Keep it concise, ideally 3-5 words.
  4. Ensure it ends with the .jpg extension.

  Context: {{{context}}}
  
  Generate a filename.`,
});

const generateFilenameFlow = ai.defineFlow(
  {
    name: 'generateFilenameFlow',
    inputSchema: GenerateFilenameInputSchema,
    outputSchema: GenerateFilenameOutputSchema,
  },
  async input => {
    const {output} = await generateFilenamePrompt(input);
    return output!;
  }
);
