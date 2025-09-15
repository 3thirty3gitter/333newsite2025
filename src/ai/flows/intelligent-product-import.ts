
'use server';

/**
 * @fileOverview An intelligent flow for importing products from any CSV format.
 *
 * - intelligentProductImport - A function that takes raw CSV data and returns structured product data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Product } from '@/lib/types';

const PRODUCT_TYPE_DEFINITION = `
export type Product = {
  id: string; // You should NOT generate this. It's assigned by the database.
  name: string;
  handle: string;
  description: string;
  longDescription: string;
  price: number;
  images: string[];
  category: string;
  vendor?: string;
  tags?: string[];
  variants: Variant[];
  inventory: InventoryItem[];
  status: 'active' | 'draft';
  compareAtPrice?: number | null;
  costPerItem?: number | null;
  isTaxable: boolean;
  trackQuantity: boolean;
  allowOutOfStockPurchase: boolean;
  seoTitle?: string;
  seoDescription?: string;
};

export type Variant = {
    type: string; // e.g., "Size", "Color"
    options: VariantOption[];
}

export type VariantOption = {
    value: string; // e.g., "Small", "Red"
    image?: string; 
}

export type InventoryItem = {
    id: string; // Combination of variant values, e.g., "Small-Red"
    price: number;
    stock: number;
    sku?: string;
    barcode?: string;
    grams?: number;
}
`;


const IntelligentProductImportInputSchema = z.object({
  csvData: z.string().describe('The full, raw text content of the CSV file.'),
});
export type IntelligentProductImportInput = z.infer<typeof IntelligentProductImportInputSchema>;

// The output will be a list of products that can be directly used in our app
const IntelligentProductImportOutputSchema = z.object({
  products: z.array(z.custom<Omit<Product, 'id'>>()),
});
export type IntelligentProductImportOutput = z.infer<typeof IntelligentProductImportOutputSchema>;

export async function intelligentProductImport(input: IntelligentProductImportInput): Promise<IntelligentProductImportOutput> {
  return intelligentProductImportFlow(input);
}

const intelligentProductImportPrompt = ai.definePrompt({
  name: 'intelligentProductImportPrompt',
  input: { schema: IntelligentProductImportInputSchema },
  output: { schema: IntelligentProductImportOutputSchema },
  prompt: `
    You are an expert data migration specialist for e-commerce systems.
    Your task is to analyze an arbitrary CSV file and map its data to a specific JSON structure for products.

    This is the target JSON structure for each product. You must adhere to this structure exactly.
    Do NOT generate an "id" for the top-level product. It will be created by the database.
    
    TARGET SCHEMA:
    ${PRODUCT_TYPE_DEFINITION}
    
    You must intelligently map the columns from the source CSV to the fields in the target schema.
    - Analyze the headers and a few rows to understand the data.
    - Some columns might not exist in the source CSV. In that case, use reasonable defaults (e.g., status: 'draft', isTaxable: true, empty strings for optional fields).
    - Handle complex data transformations. For example:
      - If you see "Image 1", "Image 2", etc., combine them into the 'images' array.
      - If you see columns like "Size", "Color", "Material", figure out how to create the 'variants' and 'inventory' arrays. The 'inventory.id' should be a hyphenated combination of the variant option values (e.g., 'Small-Red').
      - A single row in the CSV might represent a single product variant. You need to group rows that belong to the same product. A "handle" or "product name" column is a good indicator for grouping.
    - Be robust. If a row is clearly invalid or missing essential data like a name or price, skip it.

    Here is the CSV data you need to process:
    
    CSV DATA:
    {{{csvData}}}
    
    Now, perform the mapping and return the data as a JSON object with a single key "products", which is an array of product objects conforming to the schema.
  `,
});

const intelligentProductImportFlow = ai.defineFlow(
  {
    name: 'intelligentProductImportFlow',
    inputSchema: IntelligentProductImportInputSchema,
    outputSchema: IntelligentProductImportOutputSchema,
  },
  async (input) => {
    const { output } = await intelligentProductImportPrompt(input);
    if (!output) {
      throw new Error("The AI model failed to process the CSV data. It might be in an unsupported format or empty.");
    }
    return output;
  }
);
