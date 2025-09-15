
'use server';

/**
 * @fileOverview An intelligent flow for importing products from any CSV format.
 *
 * - intelligentProductImport - A function that takes raw CSV data and returns structured product data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Product as AppProduct } from '@/lib/types';

const VariantOptionSchema = z.object({
  value: z.string().describe('e.g., "Small", "Red"'),
  image: z.string().url().optional().describe('An image URL associated with this specific variant option, if available.'),
});

const VariantSchema = z.object({
    type: z.string().describe('e.g., "Size", "Color"'),
    options: z.array(VariantOptionSchema),
});

const InventoryItemSchema = z.object({
    id: z.string().describe('Combination of variant values, e.g., "Small-Red"'),
    price: z.number(),
    stock: z.number(),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    grams: z.number().optional(),
});

const ProductSchema = z.object({
  name: z.string(),
  handle: z.string(),
  description: z.string(),
  longDescription: z.string(),
  price: z.number(),
  images: z.array(z.string().url()),
  category: z.string(),
  vendor: z.string().optional(),
  tags: z.array(z.string()).optional(),
  variants: z.array(VariantSchema),
  inventory: z.array(InventoryItemSchema),
  status: z.enum(['active', 'draft']),
  compareAtPrice: z.number().nullable().optional(),
  costPerItem: z.number().nullable().optional(),
  isTaxable: z.boolean(),
  trackQuantity: z.boolean(),
  allowOutOfStockPurchase: z.boolean(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

const PRODUCT_TYPE_DEFINITION = `
// Note: This is a simplified version for the AI. The full schema is more complex.
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
  variants: {
    type: string; // e.g., "Size", "Color"
    options: {
        value: string; // e.g., "Small", "Red"
        image?: string; 
    }[];
  }[];
  inventory: {
    id: string; // Combination of variant values, e.g., "Small-Red"
    price: number;
    stock: number;
    sku?: string;
    barcode?: string;
    grams?: number;
  }[];
  status: 'active' | 'draft';
  compareAtPrice?: number | null;
  costPerItem?: number | null;
  isTaxable: boolean;
  trackQuantity: boolean;
  allowOutOfStockPurchase: boolean;
  seoTitle?: string;
  seoDescription?: string;
};
`;


const IntelligentProductImportInputSchema = z.object({
  csvData: z.string().describe('The full, raw text content of the CSV file.'),
});
export type IntelligentProductImportInput = z.infer<typeof IntelligentProductImportInputSchema>;

// The output will be a list of products that can be directly used in our app
const IntelligentProductImportOutputSchema = z.object({
  products: z.array(ProductSchema),
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
    You are a highly specialized backend AI agent for the e-commerce company "3Thirty3". Your only role is to reliably transform any CSV file into a fully valid array of 3Thirty3 Product objects.

    This is the strict target JSON structure for each product. You must adhere to this structure exactly. Do NOT generate a top-level "id" for the product; the database will assign it.

    TARGET 3THIRTY3 PRODUCT SCHEMA:
    ${PRODUCT_TYPE_DEFINITION}

    Your Requirements:
    1.  Carefully analyze the CSV headers and data to determine which columns map to which schema fields.
        -   Group multiple rows into a single product object when they share a common "handle" or "product name".
        -   Combine all detected image columns (e.g., "Image 1", "Image 2", "Image Src") into a single "images" array.
        -   Correctly construct the "variants" and "inventory" arrays from option columns like "Size", "Color", "Option1 Name", "Option1 Value", etc. The 'inventory.id' MUST be a hyphenated combination of the variant option values (e.g., 'Small-Red').
    2.  If required fields are missing from the CSV, you MUST use these defaults:
        -   status: "draft"
        -   isTaxable: true
        -   For other missing optional fields, use empty strings, nulls, or empty arrays as appropriate for the schema.
    3.  For any row that cannot be reliably and completely mapped to a valid Product object, **you must skip it**. Return only products that fully fit the schema.
    4.  Do not hallucinate or guess values. If a value isn't in the CSV, use a default or omit it if optional.
    5.  Your final output must be an exact JSON object: { "products": [ ...validProductObjects ] }.

    Here is the CSV data you need to process:

    CSV DATA:
    {{{csvData}}}

    Now, perform the mapping and return the data as a JSON object with a single key "products".
  `,
});

const intelligentProductImportFlow = ai.defineFlow(
  {
    name: 'intelligentProductImportFlow',
    inputSchema: IntelligentProductImportInputSchema,
    outputSchema: IntelligentProductImportOutputSchema,
  },
  async (input) => {
    try {
        const { output } = await intelligentProductImportPrompt(input);
        if (!output) {
        throw new Error("The AI model failed to process the CSV data. It might be in an unsupported format or empty.");
        }
        return output;
    } catch (error: any) {
        console.error("Error in intelligentProductImportFlow:", error);
        throw new Error(`The AI model could not process the file. Please ensure the CSV is formatted correctly. Server error: ${error.message}`);
    }
  }
);
