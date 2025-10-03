import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  totalResults: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  isLoading: boolean;
}

export function Pagination({
  currentPage,
  hasNextPage,
  totalResults,
  onPreviousPage,
  onNextPage,
  isLoading,
}: PaginationProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Page <span className="font-medium text-slate-900">{currentPage}</span>
          {totalResults > 0 && (
            <span className="ml-2">
              ({totalResults} result{totalResults !== 1 ? 's' : ''})
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onPreviousPage}
            disabled={currentPage === 1 || isLoading}
            className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>

          <button
            onClick={onNextPage}
            disabled={!hasNextPage || isLoading}
            className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
