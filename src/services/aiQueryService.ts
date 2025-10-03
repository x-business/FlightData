import { supabase } from '../lib/supabase';
import { AIQuery, FlightFilters } from '../types/flight';

export async function saveAIQuery(
  userQuery: string,
  parsedFilters: FlightFilters | null,
  resultCount: number
): Promise<void> {
  try {
    const { error } = await supabase.from('ai_queries').insert({
      user_query: userQuery,
      parsed_filters: parsedFilters,
      result_count: resultCount,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving AI query:', error);
  }
}

export async function getAIQueryHistory(limit: number = 10): Promise<AIQuery[]> {
  try {
    const { data, error } = await supabase
      .from('ai_queries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching AI query history:', error);
    return [];
  }
}
