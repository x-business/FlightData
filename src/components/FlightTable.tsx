import { FlightItem } from '../types/flight';
import { Plane, Clock, MapPin, Calendar } from 'lucide-react';

interface FlightTableProps {
  flights: FlightItem[];
}

export function FlightTable({ flights }: FlightTableProps) {
  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC', // Force UTC to avoid time zone adjustments
      });
    } catch {
      return 'N/A';
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return 'N/A';
    return time;
  };

  const getStatusLabel = (isPlaceholder?: boolean) => {
    return isPlaceholder ? 'Scheduled' : 'Confirmed';
  };

  const getStatusStyle = (isPlaceholder?: boolean) => {
    return isPlaceholder
      ? 'bg-amber-100 text-amber-700 border border-amber-300'
      : 'bg-emerald-100 text-emerald-700 border border-emerald-300';
  };

  if (flights.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-200/40 to-amber-100/40 blur-3xl rounded-full" />
          <Plane className="w-20 h-20 text-gray-400 mx-auto mb-6 relative animate-pulse" />
        </div>
        <p className="text-gray-800 text-xl font-semibold mb-2">No flights found</p>
        <p className="text-gray-500 text-sm">Try adjusting your filters or search criteria</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400/50 scrollbar-track-transparent">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-gray-400" />
                  Flight
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest">
                Airline
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest hidden lg:table-cell w-[15%] min-w-[50px]">
                Aircraft
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest w-[10%] min-w-[50px]">
                Origin
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest w-[10%] min-w-[50px]">
                Destination
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest hidden md:table-cell">
                Departure
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest hidden xl:table-cell">
                Service Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-widest">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {flights.map((flight, index) => (
              <tr
                key={flight.id}
                className="group hover:bg-gray-50 transition-all duration-200 ease-in-out"
                style={{
                  animation: `fadeIn 0.5s ease-in-out ${index * 0.05}s both`
                }}
              >
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors border border-gray-300">
                      <Plane className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="text-sm font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                      {flight.data.flight_number || 'N/A'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                    {flight.data.airline_iata || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-5 hidden lg:table-cell w-[15%] min-w-[50px]">
                  <div className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                    {flight.data.aircraft_model_text || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-5 w-[10%] min-w-[50px]">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors truncate max-w-[100px] md:max-w-none">
                        {flight.data.origin_airport_name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        [{flight.data.origin_iata || 'N/A'}]
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 w-[10%] min-w-[50px]">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-800 group-hover:text-gray-900 transition-colors truncate max-w-[100px] md:max-w-none">
                        {flight.data.destination_airport_name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        [{flight.data.destination_iata || 'N/A'}]
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-100 rounded-lg border border-gray-300">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {formatTime(flight.data.dep_hhmm_local)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap hidden xl:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-100 rounded-lg border border-gray-300">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {formatDate(flight.data.service_date)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span
                    className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${getStatusStyle(
                      flight.data.is_placeholder
                    )}`}
                  >
                    {getStatusLabel(flight.data.is_placeholder)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
