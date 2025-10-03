import { FlightFilters, FlightResponse } from '../types/flight';

const FLIGHT_API_URL = 'https://n8n-dev.qrewhub.com/webhook/flight-data-test';

export async function fetchFlights(filters: FlightFilters): Promise<FlightResponse> {
  try {
    const response = await fetch(FLIGHT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching flights:', error);
    throw error;
  }
}

export function createCacheKey(filters: FlightFilters): string {
  return JSON.stringify(filters);
}
