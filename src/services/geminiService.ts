import { FlightFilters } from '../types/flight';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function parseNaturalLanguageQuery(query: string): Promise<FlightFilters | null> {
  if (!GEMINI_API_KEY) {
    console.error('Gemini API key not configured');
    return null;
  }

  const prompt = `Parse the following natural language flight query into structured filters. Today's date is ${new Date().toISOString().split('T')[0]}.

Available data dates: 2025-10-02, 2025-10-03, 2025-10-08, 2025-10-09, 2025-10-10

Query: "${query}"

Extract and return ONLY a valid JSON object with these optional fields:
- service_date (YYYY-MM-DD format, use one of the available dates above)
- origin_data (3-letter airport code)
- destination_data (3-letter airport code)
- airline_data (2-letter airline code)
- route_data (format: XXX-YYY)
- sortBy ("utc" or "local")

Time interpretations:
- "morning" = flights between 06:00-12:00
- "afternoon" = flights between 12:00-18:00
- "evening" = flights between 18:00-23:59
- "after lunch" = afternoon/evening

Country to airport mappings (examples):
- Australia: SYD, MEL, BNE, PER
- Philippines: MNL, CEB
- USA: LAX, JFK, ORD
- UK: LHR, LGW

Return ONLY the JSON object, no explanation:`;

  try {
    const response = await fetch(
      `https://cors-anywhere.herokuapp.com/https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 256,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No response from Gemini');
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response');
    }

    const filters = JSON.parse(jsonMatch[0]);

    if (!filters.service_date) {
      filters.service_date = '2025-10-09';
    }

    filters.limit = 100;

    return filters;
  } catch (error) {
    console.error('Error parsing natural language query:', error);
    throw error;
  }
}
