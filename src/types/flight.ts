export interface FlightItem {
  id: string;
  data: {
    flight_number?: string;
    airline_iata?: string;
    aircraft_model_text?: string;
    origin_airport_name?: string;
    origin_iata?: string;
    destination_airport_name?: string;
    destination_iata?: string;
    dep_hhmm_local?: string;
    service_date?: string;
    is_placeholder?: boolean;
  };
}

export interface FlightResponse {
  ok: boolean;
  count: number;
  nextPageToken: string | null;
  items: FlightItem[];
}

export interface FlightFilters {
  service_date: string;
  origin_data?: string;
  destination_data?: string;
  airline_data?: string;
  route_data?: string;
  sortBy?: 'departure_time' | 'arrival_time' | 'airline'; // Updated sorting options
  limit?: number;
  startAfterDocId?: string;
}

export interface AIQuery {
  id: string;
  user_query: string;
  parsed_filters: FlightFilters | null;
  result_count: number;
  created_at: string;
}