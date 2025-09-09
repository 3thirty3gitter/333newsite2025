
'use server';

/**
 * @fileOverview A flow for generating hero section text (title and subtitle).
 *
 * - generateHeroText - Generates a title and/or subtitle based on a topic.
 * - GenerateHeroTextInput - Input schema for the flow.
 * - GenerateHeroTextOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateHeroTextInputSchema = z.object({
  topic: z.string().describe('The topic or theme for the hero section (e.g., "custom printing e-commerce").'),
  existingTitle: z.string().optional().describe('An existing title, if a new subtitle needs to be generated for it.'),
});
export type GenerateHeroTextInput = z.infer<typeof GenerateHeroTextInputSchema>;

const GenerateHeroTextOutputSchema = z.object({
  title: z.string().optional().describe('The generated hero title.'),
  subtitle: z.string().optional().describe('The generated hero subtitle.'),
});
export type GenerateHeroTextOutput = z.infer<typeof GenerateHeroTextOutputSchema>;

const generateHeroTextPrompt = ai.definePrompt({
    name: 'generateHeroTextPrompt',
    input: { schema: GenerateHeroTextInputSchema },
    output: { schema: GenerateHeroTextOutputSchema },
    prompt: `You are a creative marketing assistant for an e-commerce website.
    
    Your task is to generate compelling text for a hero section.
    
    {{#if existingTitle}}
    The title is: "{{existingTitle}}". Generate a matching subtitle for the topic: "{{topic}}".
    The subtitle should be short, catchy, and complement the title. Only generate the subtitle.
    {{else}}
    The topic for the hero section is: "{{topic}}". 
    Generate a short, catchy title and a compelling one-sentence subtitle that fits this topic.
    Make it exciting and inviting for a potential customer.
    {{/if}}
    `,
});

const generateHeroTextFlow = ai.defineFlow(
  {
    name: 'generateHeroTextFlow',
    inputSchema: GenerateHeroTextInputSchema,
    outputSchema: GenerateHeroTextOutputSchema,
  },
  async (input) => {
    const { output } = await generateHeroTextPrompt(input);
    return output!;
  }
);


export async function generateHeroText(input: GenerateHeroTextInput): Promise<GenerateHeroTextOutput> {
  return generateHeroTextFlow(input);
}
