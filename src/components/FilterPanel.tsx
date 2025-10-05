import { FlightFilters } from '../types/flight';
import { Calendar, MapPin, Plane, SlidersHorizontal, List, Sparkles, Clock } from 'lucide-react';
import { MultiSelect } from './common/MultiSelect';

interface FilterPanelProps {
  filters: FlightFilters;
  onFiltersChange: (filters: FlightFilters) => void;
  onApplyFilters: (filters: FlightFilters) => void;
}

export function FilterPanel({ filters, onFiltersChange, onApplyFilters }: FilterPanelProps) {
  const handleChange = (field: keyof FlightFilters, value: string) => {
    const updatedFilters = {
      ...filters,
      [field]: value || undefined,
    };
    onFiltersChange(updatedFilters);
    onApplyFilters(updatedFilters);
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-10 overflow-hidden animate-slideDown">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm">
            <SlidersHorizontal className="w-6 h-6 text-blue-600" />
            <div className="absolute -top-1.5 -right-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Flight Filters</h2>
            <p className="text-sm text-gray-500">Refine your search criteria</p>
          </div>
        </div>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Service Date */}
        <div className="group animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <Label icon={<Calendar className="text-blue-500" />} title="Service Date" />
          <Input
            type="date"
            value={filters.service_date}
            onChange={(e) => handleChange('service_date', e.target.value)}
            helper="Available: 2–3, 8–10 Oct 2025"
          />
        </div>

        {/* Origin Airport */}
        <div className="group animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <Label icon={<MapPin className="text-green-500" />} title="Origin Airport" />
          <Input
            type="text"
            placeholder="e.g., BNE"
            value={filters.origin_data || ''}
            onChange={(e) => handleChange('origin_data', e.target.value.toUpperCase())}
            badge="IATA"
            maxLength={3}
            uppercase
          />
        </div>

        {/* Destination Airport */}
        <div className="group animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          <Label icon={<MapPin className="text-red-500" />} title="Destination Airport" />
          <Input
            type="text"
            placeholder="e.g., ISA"
            value={filters.destination_data || ''}
            onChange={(e) => handleChange('destination_data', e.target.value.toUpperCase())}
            badge="IATA"
            maxLength={3}
            uppercase
          />
        </div>

        {/* Airline */}
        <div className="group animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
          <Label icon={<Plane className="text-indigo-500" />} title="Airline" />
          <Input
            type="text"
            placeholder="e.g., QF"
            value={filters.airline_data || ''}
            onChange={(e) => handleChange('airline_data', e.target.value.toUpperCase())}
            badge="CODE"
            maxLength={2}
            uppercase
          />
        </div>

        {/* Departure Time Range */}
        <div className="group animate-fadeInUp" style={{ animationDelay: '0.45s' }}>
          <Label icon={<Clock className="text-orange-500" />} title="Departure Time Range" />
          <MultiSelect
            value={filters.departure_time_range || []}
            onChange={(selected) => handleChange("departure_time_range", selected)}
            options={[
              { value: "morning", label: "Morning (05:00 – 11:59)" },
              { value: "afternoon", label: "Afternoon (12:00 – 17:59)" },
              { value: "evening", label: "Evening (18:00 – 22:59)" },
              { value: "night", label: "Night (23:00 – 04:59)" },
            ]}
          />
        </div>

        {/* Sort By */}
        <div className="group animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
          <Label icon={<SlidersHorizontal className="text-purple-500" />} title="Sorting" />
          <Select
            value={filters.sortBy || 'departure_time'}
            onChange={(e) => handleChange('sortBy', e.target.value)}
            options={[
              { value: 'departure_time', label: 'Departure Time' },
              { value: 'arrival_time', label: 'Arrival Time' },
              { value: 'airline', label: 'Airline' },
            ]}
          />
        </div>

        {/* Results Per Page */}
        <div className="group animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
          <Label icon={<List className="text-gray-600" />} title="Results Per Page" />
          <Select
            value={filters.limit || 20}
            onChange={(e) => handleChange('limit', e.target.value)}
            options={[
              { value: '10', label: '10' },
              { value: '20', label: '20' },
              { value: '50', label: '50' },
              { value: '100', label: '100' },
              { value: '200', label: '200' },
            ]}
          />
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown { animation: slideDown 0.6s ease-out; }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out both; }
      `}</style>
    </div>
  );
}

/* Sub-components */
function Label({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
      <div className="p-1.5 bg-gray-100 rounded-md border border-gray-200">{icon}</div>
      {title}
    </label>
  );
}

function Input({
  type,
  value,
  onChange,
  placeholder,
  badge,
  helper,
  maxLength,
  uppercase,
}: {
  type: string;
  value?: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  badge?: string;
  helper?: string;
  maxLength?: number;
  uppercase?: boolean;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value || ''}
        placeholder={placeholder}
        onChange={onChange}
        maxLength={maxLength}
        className={`w-full px-4 py-3 pr-16 bg-white border border-gray-300 rounded-lg 
          text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 
          focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 
          hover:border-gray-400 hover:shadow-sm font-medium ${uppercase ? 'uppercase' : ''}`}
      />
      {badge && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-600 text-xs font-bold">
          {badge}
        </div>
      )}
      {helper && <p className="text-xs text-gray-500 mt-2">{helper}</p>}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string | number;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-white border border-gray-300 
        rounded-lg text-gray-700 focus:outline-none focus:ring-2 
        focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 
        hover:border-gray-400 hover:shadow-sm cursor-pointer appearance-none 
        pr-10 font-medium"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white text-gray-700">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}