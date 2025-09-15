
'use server';

/**
 * @fileOverview A flow for creating a shipment using the EasyPost API.
 *
 * - createShipmentFlow - A function that creates a shipment and returns rates.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { createShipment, type Address, type Parcel } from '@/lib/easypost';

const AddressSchema = z.object({
    street1: z.string(),
    street2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    country: z.string(),
    company: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
});

const ParcelSchema = z.object({
    length: z.number(),
    width: z.number(),
    height: z.number(),
    weight: z.number().describe("Weight in ounces"),
});

const CreateShipmentInputSchema = z.object({
  toAddress: AddressSchema,
  fromAddress: AddressSchema,
  parcel: ParcelSchema,
});
export type CreateShipmentInput = z.infer<typeof CreateShipmentInputSchema>;


const RateSchema = z.object({
    id: z.string(),
    carrier: z.string(),
    service: z.string(),
    rate: z.string(),
    currency: z.string(),
    delivery_days: z.number().nullable(),
});

const CreateShipmentOutputSchema = z.object({
    id: z.string(),
    rates: z.array(RateSchema),
});
export type CreateShipmentOutput = z.infer<typeof CreateShipmentOutputSchema>;


export async function createShipmentFlow(input: CreateShipmentInput): Promise<CreateShipmentOutput> {
  return createShipmentFlowInternal(input);
}


const createShipmentFlowInternal = ai.defineFlow(
  {
    name: 'createShipmentFlow',
    inputSchema: CreateShipmentInputSchema,
    outputSchema: CreateShipmentOutputSchema,
  },
  async ({ toAddress, fromAddress, parcel }) => {
    
    const shipmentDetails = await createShipment(
        toAddress as Address, 
        fromAddress as Address, 
        parcel as Parcel
    );
    
    // The rate comes back as a string, so we need to parse it for the schema
    const formattedRates = shipmentDetails.rates.map(rate => ({
      ...rate,
      rate: String(rate.rate), 
    }));

    return {
      id: shipmentDetails.id,
      rates: formattedRates,
    };
  }
);
