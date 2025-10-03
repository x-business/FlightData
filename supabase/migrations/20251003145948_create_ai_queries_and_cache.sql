/*
  # Create AI Queries and Flight Cache Tables

  1. New Tables
    - `ai_queries`
      - `id` (uuid, primary key)
      - `user_query` (text) - The natural language query entered by user
      - `parsed_filters` (jsonb) - Parsed filter parameters from AI
      - `result_count` (integer) - Number of results returned
      - `created_at` (timestamptz) - When the query was made
    
    - `flight_cache`
      - `id` (uuid, primary key)
      - `cache_key` (text, unique) - Hash of request parameters
      - `response_data` (jsonb) - Cached API response
      - `expires_at` (timestamptz) - Cache expiration time
      - `created_at` (timestamptz) - When the cache entry was created

  2. Security
    - Enable RLS on both tables
    - Public read access for ai_queries (for displaying history)
    - Public write access for ai_queries (for storing new queries)
    - No public access to flight_cache (backend only)
*/

CREATE TABLE IF NOT EXISTS ai_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_query text NOT NULL,
  parsed_filters jsonb,
  result_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS flight_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text UNIQUE NOT NULL,
  response_data jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to ai_queries"
  ON ai_queries FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to ai_queries"
  ON ai_queries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "No public access to flight_cache"
  ON flight_cache FOR SELECT
  USING (false);

CREATE INDEX IF NOT EXISTS idx_flight_cache_key ON flight_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_flight_cache_expires ON flight_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_queries_created ON ai_queries(created_at DESC);