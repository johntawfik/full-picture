# Full Picture API

This is the backend API for the Full Picture application, which provides endpoints for retrieving news perspectives from different communities.

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Create a `.env` file with the following variables:
   ```
   NEON_DB_URL=your_database_connection_string
   ```

## Running the API

To run the API locally:

```
python api/main.py
```

The API will be available at http://localhost:8000.

## API Endpoints

### GET /api/perspectives

Retrieves perspectives based on a search query and optional filters.

**Parameters:**
- `query` (required): Search query
- `communities` (optional): Filter by communities (e.g., left, right, center)
- `sources` (optional): Filter by sources

### GET /api/timeline

Retrieves timeline perspectives based on a search query and optional filters.

**Parameters:**
- `query` (required): Search query
- `communities` (optional): Filter by communities (e.g., left, right, center)
- `sources` (optional): Filter by sources

### GET /api/sources

Retrieves available sources for a search query.

**Parameters:**
- `query` (required): Search query

## API Documentation

When the API is running, you can access the Swagger documentation at:
http://localhost:8000/docs 