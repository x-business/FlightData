# Flight Data Dashboard with AI-Powered Natural Language Filtering

A full-stack React application that displays live flight data with advanced filtering, pagination, and AI-powered natural language search capabilities using Google Gemini.

## Features

- **Real-time Flight Data**: Fetches live flight information from the n8n API
- **Advanced Filtering**: Filter by airport, airline, destination, and date
- **Pagination**: Navigate through large datasets efficiently with proper page state management
- **Sorting**: Sort flights by local or UTC time
- **AI-Powered Search**: Natural language queries powered by Google Gemini
  - Example: "Show me all flights from Brisbane to Manila on October 9"
  - Example: "All flights leaving Australia after lunch time"
- **Query History**: Stores and displays previous AI searches in Supabase database
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Loading States**: Clear feedback during data fetching
- **Error Handling**: Comprehensive error messages for better user experience

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend & Services
- **Supabase** for database (PostgreSQL)
- **Google Gemini AI** for natural language processing
- **n8n API** for flight data

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- Google Gemini API key from [AI Studio](https://aistudio.google.com/api-keys)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd project
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables

Edit the `.env` file and add your Google Gemini API key:

```env
VITE_SUPABASE_URL=https://qsbxfzxtgqjtgpsngupd.supabase.co
VITE_SUPABASE_ANON_KEY=<already-configured>
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

4. Start the development server
```bash
npm run dev
```

5. Build for production
```bash
npm run build
```

6. Preview production build
```bash
npm run preview
```

## Project Structure

```
src/
├── components/           # React components
│   ├── AIQueryPanel.tsx     # Natural language search interface
│   ├── FilterPanel.tsx      # Manual filter controls
│   ├── FlightTable.tsx      # Flight data table
│   ├── Pagination.tsx       # Pagination controls
│   └── QueryHistory.tsx     # AI query history display
├── services/            # API and business logic
│   ├── flightApi.ts         # Flight data fetching
│   ├── geminiService.ts     # AI query parsing
│   └── aiQueryService.ts    # Query history management
├── types/              # TypeScript definitions
│   └── flight.ts           # Flight data types
├── lib/                # Utility libraries
│   └── supabase.ts         # Supabase client
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## Database Schema

### ai_queries Table
Stores AI search queries and results:
- `id` (uuid): Primary key
- `user_query` (text): Natural language query
- `parsed_filters` (jsonb): Extracted filter parameters
- `result_count` (integer): Number of results found
- `created_at` (timestamptz): Query timestamp

### flight_cache Table
Caches API responses (backend use only):
- `id` (uuid): Primary key
- `cache_key` (text): Unique identifier for cached data
- `response_data` (jsonb): Cached API response
- `expires_at` (timestamptz): Cache expiration time
- `created_at` (timestamptz): Cache creation time

## API Integration

### n8n Flight Data API

**Endpoint**: `https://n8n-dev.qrewhub.com/webhook/flight-data-test`

**Available Dates**: October 2-3 and 8-10, 2025

**Request Example**:
```json
{
  "service_date": "2025-10-09",
  "origin_data": "BNE",
  "destination_data": "MNL",
  "limit": 100,
  "sortBy": "local"
}
```

**Response Format**:
```json
{
  "ok": true,
  "count": 50,
  "nextPageToken": "doc123",
  "items": [
    {
      "id": "flight123",
      "data": {
        "flight_data": "QF123",
        "airline_name": "Qantas",
        "origin_data": "BNE",
        "destination_data": "MNL",
        ...
      }
    }
  ]
}
```

## Design Decisions

### Architecture
- **Modular Component Design**: Each component has a single responsibility, making the code maintainable and testable
- **Service Layer**: Separated API calls and business logic from UI components
- **Type Safety**: Full TypeScript coverage ensures type safety throughout the application

### State Management
- **Local State with Hooks**: Uses React hooks for straightforward state management
- **Page Token Management**: Stores page tokens in a map to enable both forward and backward pagination

### AI Integration
- **Natural Language Processing**: Google Gemini parses user queries into structured filter parameters
- **Query History**: All AI searches are stored in Supabase for user reference and analysis
- **Error Handling**: Graceful fallbacks when AI parsing fails

### Caching Strategy
- **Database Schema**: Prepared for API response caching (currently implemented at schema level)
- **Future Enhancement**: Can be extended to reduce redundant API calls

### UX/UI Design
- **Clean, Modern Interface**: Slate color palette for professional appearance
- **Responsive Layout**: Mobile-first design with breakpoints for larger screens
- **Visual Feedback**: Loading states, error messages, and success indicators
- **Accessibility**: Semantic HTML and proper ARIA labels

## Usage

### Manual Filtering
1. Use the filter panel to select:
   - Service date (use available dates: Oct 2-3 or 8-10, 2025)
   - Origin airport (3-letter data code)
   - Destination airport (3-letter data code)
   - Airline (2-letter data code)
   - Sort order (Local or UTC time)
2. Click "Apply Filters" to search

### AI-Powered Search
1. Type a natural language query in the AI search box
2. Examples:
   - "Show me flights from Brisbane to Manila on October 9"
   - "All flights leaving Australia to the Philippines after lunch time"
   - "Flights to Manila tomorrow"
3. Click "Search" or press Enter
4. Results will display with the parsed filters shown

### Pagination
- Use "Previous" and "Next" buttons to navigate through results
- Page number and result count are displayed
- Previous pages are cached for faster navigation

## Known Limitations

- Data is only available for specific dates (Oct 2-3 and 8-10, 2025)
- AI parsing requires a valid Gemini API key
- API rate limits may apply depending on usage

## Future Enhancements

- Real-time flight status updates
- Advanced analytics and visualizations
- Export functionality (CSV, JSON, PDF)
- User authentication and personalized filters
- Flight price tracking
- Email notifications for flight changes
- Voice input for AI queries

## License

This project is for demonstration purposes as part of a developer examination.
