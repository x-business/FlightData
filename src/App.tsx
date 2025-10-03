import { useState, useEffect } from 'react';
import { Plane, AlertCircle, Loader2 } from 'lucide-react';
import { FlightFilters, FlightItem } from './types/flight';
import { fetchFlights } from './services/flightApi';
import { saveAIQuery } from './services/aiQueryService';
import { FilterPanel } from './components/FilterPanel';
import { FlightTable } from './components/FlightTable';
import { Pagination } from './components/Pagination';
import { AIQueryPanel } from './components/AIQueryPanel';
import { QueryHistory } from './components/QueryHistory';

function App() {
  const [filters, setFilters] = useState<FlightFilters>({
    service_date: '2025-10-09',
    limit: 20,
  });

  const [flights, setFlights] = useState<FlightItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [pageTokens, setPageTokens] = useState<{ [key: number]: string }>({});
  const [isAIQuery, setIsAIQuery] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<string | null>(null);

  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async (pageToken?: string, updatedFilters?: FlightFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const { sortBy, ...restFilters } = updatedFilters ? updatedFilters : filters;

      const requestFilters = {
        ...restFilters,
        ...(sortBy !== "local" ? { sortBy } : {}),
        startAfterDocId: pageToken,
      };

      const response = await fetchFlights(requestFilters);

      if (response.ok) {
        setFlights(response.items);
        setNextPageToken(response.nextPageToken);
      } else {
        setError('Failed to fetch flights');
      }
    } catch (err) {
      console.error('Error loading flights:', err);
      setError('An error occurred while fetching flights');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilters = (updatedFilters: FlightFilters) => {
    setCurrentPage(1);
    setPageTokens({});
    setIsAIQuery(false);
    setCurrentQuery(null);
    loadFlights(undefined, updatedFilters);
  };

  const handleAIQuery = async (parsedFilters: FlightFilters, query: string) => {
    setFilters(parsedFilters);
    setCurrentPage(1);
    setPageTokens({});
    setIsAIQuery(true);
    setCurrentQuery(query);

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchFlights(parsedFilters);

      if (response.ok) {
        setFlights(response.items);
        setNextPageToken(response.nextPageToken);

        await saveAIQuery(query, parsedFilters, response.count);
      } else {
        setError('Failed to fetch flights');
      }
    } catch (err) {
      console.error('Error loading flights:', err);
      setError('An error occurred while fetching flights');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextPage = () => {
    if (nextPageToken) {
      const newPage = currentPage + 1;
      setPageTokens((prev) => ({
        ...prev,
        [newPage]: nextPageToken,
      }));
      setCurrentPage(newPage);
      loadFlights(nextPageToken);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      const token = newPage === 1 ? undefined : pageTokens[newPage];
      setCurrentPage(newPage);
      loadFlights(token);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIi8+PC9nPjwvc3ZnPg==')] opacity-20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <header className="mb-8 lg:mb-12" style={{ animation: 'fadeIn 0.6s ease-out' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/20">
              <Plane className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                Flight Data Dashboard
              </h1>
              <p className="text-slate-400 mt-1.5">Real-time flight information with AI-powered search</p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          <div style={{ animation: 'fadeIn 0.6s ease-out 0.1s both' }}>
            <AIQueryPanel onQueryParsed={handleAIQuery} />
          </div>

          {isAIQuery && currentQuery && (
            <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 backdrop-blur-sm border border-blue-700/50 rounded-xl px-6 py-4 shadow-xl" style={{ animation: 'slideIn 0.4s ease-out' }}>
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-200">AI Search Active</p>
                  <p className="text-sm text-blue-300 mt-1">Query: "{currentQuery}"</p>
                </div>
              </div>
            </div>
          )}

          <div style={{ animation: 'fadeIn 0.6s ease-out 0.2s both' }}>
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              onApplyFilters={handleApplyFilters}
            />
          </div>

          {error && (
            <div className="bg-gradient-to-r from-red-900/40 to-rose-900/40 backdrop-blur-sm border border-red-700/50 rounded-xl px-6 py-4 shadow-xl" style={{ animation: 'slideIn 0.4s ease-out' }}>
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-red-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-200">Error</p>
                  <p className="text-sm text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-xl p-16" style={{ animation: 'fadeIn 0.3s ease-out' }}>
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-300 font-medium">Loading flights...</p>
                <p className="text-slate-500 text-sm mt-1">Please wait</p>
              </div>
            </div>
          ) : (
            <>
              <div style={{ animation: 'fadeIn 0.6s ease-out 0.3s both' }}>
                <FlightTable flights={flights} />
              </div>

              <div style={{ animation: 'fadeIn 0.6s ease-out 0.4s both' }}>
                <Pagination
                  currentPage={currentPage}
                  hasNextPage={!!nextPageToken}
                  totalResults={flights.length}
                  onPreviousPage={handlePreviousPage}
                  onNextPage={handleNextPage}
                  isLoading={isLoading}
                />
              </div>
            </>
          )}

          <div style={{ animation: 'fadeIn 0.6s ease-out 0.5s both' }}>
            <QueryHistory />
          </div>
        </div>

        <footer className="mt-12 text-center text-sm text-slate-500 pb-8">
          <div className="inline-block px-4 py-2 bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-lg">
            <p>Flight data available for October 2-3 and 8-10, 2025</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
