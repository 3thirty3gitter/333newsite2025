
'use server';

import EasyPost from '@easypost/api';

if (!process.env.EASYPOST_API_KEY) {
    console.warn("EASYPOST_API_KEY is not set. EasyPost integration will not work.");
}

const api = new EasyPost(process.env.EASYPOST_API_KEY || 'dummy_key');

export interface Address {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    company?: string;
    phone?: string;
    email?: string;
}

export interface Parcel {
    length: number;
    width: number;
    height: number;
    weight: number;
}

export async function createShipment(toAddress: Address, fromAddress: Address, parcel: Parcel) {
    try {
        const to = new api.Address(toAddress);
        const from = new api.Address(fromAddress);
        const p = new api.Parcel(parcel);

        const shipment = new api.Shipment({
            to_address: to,
            from_address: from,
            parcel: p
        });

        const savedShipment = await shipment.save();

        if (savedShipment.rates) {
            return {
                id: savedShipment.id,
                rates: savedShipment.rates.map(rate => ({
                    id: rate.id,
                    carrier: rate.carrier,
                    service: rate.service,
                    rate: rate.rate,
                    currency: rate.currency,
                    delivery_days: rate.delivery_days,
                })),
            };
        }
        
        return {
            id: savedShipment.id,
            rates: [],
        };

    } catch (e: any) {
        console.error("EasyPost API Error:", e);
        // The easypost library can throw an array of errors
        if (Array.isArray(e)) {
            const errorMessages = e.map(err => err.message).join(', ');
            throw new Error(`EasyPost Error: ${errorMessages}`);
        }
        throw new Error(`EasyPost Error: ${e.message}`);
    }
}
