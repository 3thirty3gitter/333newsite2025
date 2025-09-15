import { config } from 'dotenv';
config();

import '@/ai/flows/product-recommendations.ts';
import '@/ai/flows/generate-collection-description.ts';
import '@/ai/flows/generate-image.ts';
import '@/ai/flows/generate-filename.ts';
import '@/ai/flows/generate-hero-text.ts';
import '@/ai/flows/generate-product-details.ts';
import '@/ai/flows/scrape-product-url.ts';
import '@/ai/flows/fetch-and-upload-image.ts';
