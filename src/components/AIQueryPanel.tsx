import { useState, useRef } from 'react';
import { Sparkles, Send, Loader2, Mic, MicOff } from 'lucide-react';
import { parseNaturalLanguageQuery } from '../services/geminiService';
import { FlightFilters } from '../types/flight';

// Fix TypeScript errors for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type SpeechRecognition = any;
type SpeechRecognitionEvent = any;

interface AIQueryPanelProps {
  onQueryParsed: (filters: FlightFilters, query: string) => void;
}

export function AIQueryPanel({ onQueryParsed }: AIQueryPanelProps) {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      const filters = await parseNaturalLanguageQuery(query);
      if (filters) {
        onQueryParsed(filters, query);
        setQuery('');
      } else {
        setError('Could not parse your query. Please try rephrasing.');
      }
    } catch (err) {
      console.error('Error processing query:', err);
      setError('Failed to process your query. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Your browser does not support voice recognition.');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript.trim();
      setQuery(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopVoiceRecognition = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const exampleQueries = [
    'Show me flights from Brisbane to Manila on October 9',
    'All flights leaving Australia after lunch time',
    'Flights to the Philippines tomorrow',
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-lg shadow-sm border border-blue-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-slate-900">AI-Powered Search</h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask in plain English: 'Show flights from Sydney to Manila tomorrow'"
            className="flex-1 px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isProcessing}
          />

          {/* Voice Button */}
          <button
            type="button"
            onClick={isRecording ? stopVoiceRecognition : startVoiceRecognition}
            className={`px-3 py-3 rounded-md border transition-colors ${isRecording
              ? 'bg-red-100 border-red-400 text-red-600 hover:bg-red-200'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            title={isRecording ? 'Stop recording' : 'By voice'}
            disabled={isProcessing}
          >
            {isRecording ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>

          <button
            type="submit"
            disabled={!query.trim() || isProcessing}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Search
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div>
        <p className="text-xs font-medium text-slate-600 mb-2">Try these examples:</p>
        <div className="flex flex-wrap gap-2">
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              onClick={() => setQuery(example)}
              className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 text-slate-700 transition-colors"
              disabled={isProcessing}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
