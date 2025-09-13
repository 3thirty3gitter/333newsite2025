
'use server';

/**
 * @fileOverview A flow for scraping product data from a given URL.
 *
 * - scrapeProductUrl - A function that scrapes a URL and extracts product information.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ScrapeProductUrlInputSchema = z.object({
  url: z.string().url().describe('The URL of the product page to scrape.'),
});
export type ScrapeProductUrlInput = z.infer<typeof ScrapeProductUrlInputSchema>;

// This schema is based on the Product type, but with optional fields
// as not all information may be available on the page.
const ScrapeProductUrlOutputSchema = z.object({
  name: z.string().optional().describe('The name of the product.'),
  description: z.string().optional().describe('A short, catchy marketing description for the product.'),
  longDescription: z.string().optional().describe('A detailed, informative description of the product, highlighting its features and benefits.'),
  price: z.number().optional().describe('The main price of the product.'),
  images: z.array(z.string().url()).optional().describe('An array of URLs for product images found on the page.'),
  category: z.string().optional().describe('The category or collection the product belongs to.'),
  vendor: z.string().optional().describe('The vendor or brand of the product.'),
  tags: z.array(z.string()).optional().describe('A list of relevant tags for the product.'),
  variants: z.array(z.object({
    type: z.string().describe('The name of the variant option, e.g., "Size", "Color".'),
    options: z.array(z.object({
      value: z.string().describe('The value of the option, e.g., "Small", "Red".'),
      image: z.string().url().optional().describe('An image URL associated with this specific variant option, if available.'),
    })).describe('The available choices for this variant type.'),
  })).optional().describe('An array of product variants, such as size or color.'),
  inventory: z.array(z.object({
    id: z.string().describe('A unique identifier for the variant combination, e.g., "Small-Red".'),
    price: z.number().optional().describe('The price for this specific variant combination.'),
    stock: z.number().optional().describe('The available stock for this variant.'),
    sku: z.string().optional().describe('The SKU for this variant.'),
  })).optional().describe('Inventory details for each possible variant combination.'),
  seoTitle: z.string().optional().describe('An SEO-friendly title for the product page.'),
  seoDescription: z.string().optional().describe('An SEO-friendly meta description for the product page.'),
});

export type ScrapeProductUrlOutput = z.infer<typeof ScrapeProductUrlOutputSchema>;


export async function scrapeProductUrl(input: ScrapeProductUrlInput): Promise<ScrapeProductUrlOutput> {
  return scrapeProductUrlFlow(input);
}


const scrapeProductUrlPrompt = ai.definePrompt({
  name: 'scrapeProductUrlPrompt',
  input: { schema: ScrapeProductUrlInputSchema },
  output: { schema: ScrapeProductUrlOutputSchema },
  prompt: `You are an expert e-commerce data extraction agent. Your task is to scrape a given product page URL and extract detailed product information into a structured JSON format.

  Scrape this URL: {{{url}}}

  You must extract the following information:
  - Product name
  - A short marketing description and a longer, more detailed description.
  - The main price of the product.
  - A list of all product image URLs. Find the highest resolution images available.
  - The product category and vendor/brand.
  - A list of relevant SEO tags.
  - All product variants (e.g., Size, Color) and their available options. If a variant option (like a color) has its own image, extract that URL.
  - The inventory data for each variant combination, including price, stock, and SKU if available. The 'id' for inventory should be a hyphenated combination of the variant values (e.g., 'Small-Red').
  - SEO title and description for the product page.
  
  Pay close attention to the requested JSON schema and format the output exactly as specified. If a piece of information is not available, omit the field. Convert all prices to numbers.`,
});

const scrapeProductUrlFlow = ai.defineFlow(
  {
    name: 'scrapeProductUrlFlow',
    inputSchema: ScrapeProductUrlInputSchema,
    outputSchema: ScrapeProductUrlOutputSchema,
  },
  async (input) => {
    const { output } = await scrapeProductUrlPrompt(input);
    if (!output) {
      throw new Error('The AI model failed to extract any data from the provided URL. Please check the URL and try again.');
    }
    return output;
  }
);
