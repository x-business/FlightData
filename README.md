# Flight Data Dashboard

A modern React-based flight data dashboard that connects to a flight API and integrates AI-powered natural language query capabilities. Built with TypeScript, Vite, and Tailwind CSS.

## Features

- **Real-time Flight Data**: Fetches flight information from a provided API
- **AI-Powered Search**: Natural language queries using Google Gemini AI
- **Advanced Filtering**: Filter flights by date, origin, destination, airline, and time ranges
- **Pagination**: Navigate through large datasets efficiently
- **Sorting**: Sort flights by departure time, arrival time, or airline
- **Voice Input**: Speech-to-text functionality for hands-free querying
- **Query History**: Track and view previous AI queries
- **Responsive Design**: Modern UI that works on all devices
- **Database Integration**: Supabase for storing query history and caching

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini AI (@google/genai)
- **Database**: Supabase
- **Icons**: Lucide React
- **Build Tool**: Vite

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Google AI API key

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd FlightDashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup

The project includes a Supabase migration file. Run the migration to create the necessary tables:

```sql
-- Run this in your Supabase SQL editor
-- File: supabase/migrations/20251003145948_create_ai_queries_and_cache.sql
```

This creates two tables:
- `ai_queries`: Stores user queries and parsed filters
- `flight_cache`: For caching API responses (optional)

### 5. Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 6. Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/           # React components
│   ├── common/          # Shared components
│   ├── AIQueryPanel.tsx # AI search interface
│   ├── FilterPanel.tsx  # Flight filters
│   ├── FlightTable.tsx  # Flight data table
│   ├── Pagination.tsx   # Pagination controls
│   └── QueryHistory.tsx # Query history display
├── services/            # API and service layer
│   ├── flightApi.ts     # Flight API integration
│   ├── aiQueryService.ts # AI query storage
│   └── geminiService.ts # Gemini AI integration
├── types/               # TypeScript type definitions
│   └── flight.ts        # Flight-related types
├── lib/                 # External library configurations
│   └── supabase.ts      # Supabase client setup
└── App.tsx              # Main application component
```

## API Integration

The dashboard connects to a flight data API endpoint:
- **Endpoint**: `https://n8n-dev.qrewhub.com/webhook/flight-data-test`
- **Method**: POST
- **Data Format**: JSON with filter parameters

### Available Data Dates
- 2025-10-02
- 2025-10-03
- 2025-10-08
- 2025-10-09
- 2025-10-10

## AI Query Examples

The AI can understand natural language queries like:

- "Show me flights from Brisbane to Manila on October 9"
- "All flights leaving Australia after lunch time"
- "Flights to the Philippines tomorrow"
- "Morning flights from Sydney"
- "Flights between 2pm and 6pm"

## Key Features Explained

### AI Query Processing
The `geminiService.ts` handles natural language processing:
- Converts user queries to structured filter objects
- Supports time range parsing (morning, afternoon, evening, night)
- Handles airport codes and airline codes
- Provides fallback parsing for complex time expressions

### Filtering System
The `FilterPanel.tsx` provides:
- Date selection
- Origin/destination filtering
- Airline filtering
- Time range selection
- Sorting options

### Pagination
Implements cursor-based pagination using `nextPageToken` for efficient data loading.

### Voice Input
Uses Web Speech API for hands-free query input with microphone support.

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app can be deployed to any static hosting service:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of a technical challenge and is not intended for commercial use.

## Support

For questions or issues, please refer to the project documentation or contact the development team.