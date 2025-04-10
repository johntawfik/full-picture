# Full Picture

Full Picture is a web application that helps users see different perspectives on news topics from various communities.

## Project Structure

- `frontend/`: Next.js frontend application
- `backend/`: FastAPI backend application
- `scraping/`: Web scraping scripts to collect news data

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Python (v3.8 or later)
- pnpm (or npm)

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file with the following variables:
   ```
   NEON_DB_URL=your_database_connection_string
   ```

5. Run the backend API:
   ```
   python api/main.py
   ```

The backend API will be available at http://localhost:8000.

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. Run the frontend development server:
   ```
   pnpm dev
   ```

The frontend application will be available at http://localhost:3000.

## Features

- Search for news topics and see perspectives from different communities
- Filter perspectives by community and source
- View perspectives in grid, list, or timeline format
- See sentiment analysis for each perspective

## Development

### Backend API

The backend API provides the following endpoints:

- `GET /api/perspectives`: Get perspectives based on a search query
- `GET /api/timeline`: Get timeline perspectives based on a search query
- `GET /api/sources`: Get available sources for a search query

### Frontend

The frontend is built with Next.js and uses the following components:

- `ResultsGrid`: Display perspectives in a grid layout
- `ResultsList`: Display perspectives in a list layout
- `ResultsTimeline`: Display perspectives in a timeline layout
- `FilterControls`: Filter perspectives by community and source
- `PerspectiveCard`: Display a single perspective

## License

This project is licensed under the MIT License - see the LICENSE file for details. 