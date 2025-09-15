'use server';

/**
 * @fileOverview A flow for fetching an external image and re-uploading it to Firebase Storage.
 *
 * - fetchAndUploadImage - Fetches an image from a URL, and uploads it to our storage.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { uploadImageAndGetURL } from '@/lib/data';
import fetch from 'node-fetch';

const FetchAndUploadImageInputSchema = z.object({
  url: z.string().url().describe('The URL of the image to fetch.'),
});
export type FetchAndUploadImageInput = z.infer<typeof FetchAndUploadImageInputSchema>;

const FetchAndUploadImageOutputSchema = z.object({
  newUrl: z.string().url().describe('The new URL of the image in Firebase Storage.'),
});
export type FetchAndUploadImageOutput = z.infer<typeof FetchAndUploadImageOutputSchema>;

export async function fetchAndUploadImage(input: FetchAndUploadImageInput): Promise<FetchAndUploadImageOutput> {
  return fetchAndUploadImageFlow(input);
}

const fetchAndUploadImageFlow = ai.defineFlow(
  {
    name: 'fetchAndUploadImageFlow',
    inputSchema: FetchAndUploadImageInputSchema,
    outputSchema: FetchAndUploadImageOutputSchema,
  },
  async ({ url }) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      
      const dataUrl = `data:${contentType};base64,${buffer.toString('base64')}`;

      // We use the original URL as context for the filename generator
      const newUrl = await uploadImageAndGetURL(dataUrl, 'products', url);

      return { newUrl };

    } catch (error: any) {
      console.error(`Failed to process image from URL: ${url}`, error);
      // Return a placeholder or throw, for now we throw so Promise.all might fail for one.
      // A more robust solution could be to return a placeholder URL and filter it out on the client.
      throw new Error(`Failed to fetch and upload image. ${error.message}`);
    }
  }
);
