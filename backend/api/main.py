import os
import logging
import psycopg2
import re
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("api")

# Initialize FastAPI app
app = FastAPI(title="Full Picture API", description="API for retrieving news perspectives")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
def get_db_connection():
    try:
        conn = psycopg2.connect(os.environ["NEON_DB_URL"])
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        raise HTTPException(status_code=500, detail="Database connection error")

# Pydantic models
class Perspective(BaseModel):
    id: str
    title: str
    source: str
    community: str
    quote: str
    sentiment: float
    date: str
    url: str

class TimelinePerspective(BaseModel):
    date: str
    perspectives: List[Perspective]

# API endpoints
@app.get("/api/perspectives", response_model=List[Perspective])
async def get_perspectives(
    query: str = Query(..., description="Search query"),
    communities: Optional[List[str]] = Query(None, description="Filter by communities"),
    sources: Optional[List[str]] = Query(None, description="Filter by sources")
):
    """
    Get perspectives based on search query and filters
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Base query
        sql = """
            SELECT id, title, source, community, quote, sentiment, 
                   scraped_at, url
            FROM perspectives
            WHERE 
                (title ILIKE %s OR quote ILIKE %s)
        """
        params = [f"%{query}%", f"%{query}%"]
        
        # Add community filter if provided
        if communities and len(communities) > 0:
            placeholders = ', '.join(['%s'] * len(communities))
            sql += f" AND community IN ({placeholders})"
            params.extend(communities)
        
        # Add source filter if provided
        if sources and len(sources) > 0:
            placeholders = ', '.join(['%s'] * len(sources))
            sql += f" AND source IN ({placeholders})"
            params.extend(sources)
        
        # Order by date
        sql += " ORDER BY scraped_at::timestamp DESC"
        
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        
        perspectives = []
        for row in rows:
            # Extract date from scraped_at string: YYYY-MM-DDT...
            date_str = row[6]
            try:
                # Extract date part only
                if date_str and 'T' in date_str:
                    date_part = date_str.split('T')[0]  # Get YYYY-MM-DD
                    # Convert to Mon DD, YYYY format
                    import datetime
                    dt = datetime.datetime.strptime(date_part, '%Y-%m-%d')
                    formatted_date = dt.strftime('%b %d, %Y')
                else:
                    formatted_date = "Unknown Date"
            except Exception as e:
                logger.error(f"Error formatting date {date_str}: {str(e)}")
                formatted_date = "Unknown Date"
                
            # Clean quote text by removing <p> and </p> tags
            quote = row[4]
            cleaned_quote = re.sub(r'</?p>', '', quote) if quote else ""
                
            perspectives.append({
                "id": row[0],
                "title": row[1],
                "source": row[2],
                "community": row[3],
                "quote": cleaned_quote,
                "sentiment": float(row[5]),
                "date": formatted_date,
                "url": row[7]
            })
        
        cursor.close()
        conn.close()
        
        return perspectives
    
    except Exception as e:
        logger.error(f"Error fetching perspectives: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching perspectives: {str(e)}")

@app.get("/api/timeline", response_model=List[TimelinePerspective])
async def get_timeline(
    query: str = Query(..., description="Search query"),
    communities: Optional[List[str]] = Query(None, description="Filter by communities"),
    sources: Optional[List[str]] = Query(None, description="Filter by sources")
):
    """
    Get timeline perspectives based on search query and filters
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Base query
        sql = """
            SELECT id, title, source, community, quote, sentiment, 
                   scraped_at, url
            FROM perspectives
            WHERE 
                (title ILIKE %s OR quote ILIKE %s)
        """
        params = [f"%{query}%", f"%{query}%"]
        
        # Add community filter if provided
        if communities and len(communities) > 0:
            placeholders = ', '.join(['%s'] * len(communities))
            sql += f" AND community IN ({placeholders})"
            params.extend(communities)
        
        # Add source filter if provided
        if sources and len(sources) > 0:
            placeholders = ', '.join(['%s'] * len(sources))
            sql += f" AND source IN ({placeholders})"
            params.extend(sources)
        
        # Order by date
        sql += " ORDER BY scraped_at DESC"
        
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        
        # Group by date
        timeline_data = {}
        for row in rows:
            # Extract date from scraped_at string: YYYY-MM-DDT...
            date_str = row[6]
            try:
                # Extract date part only
                if date_str and 'T' in date_str:
                    date_part = date_str.split('T')[0]  # Get YYYY-MM-DD
                    # Convert to Mon DD, YYYY format
                    import datetime
                    dt = datetime.datetime.strptime(date_part, '%Y-%m-%d')
                    formatted_date = dt.strftime('%b %d, %Y')
                else:
                    formatted_date = "Unknown Date"
            except Exception as e:
                logger.error(f"Error formatting date {date_str}: {str(e)}")
                formatted_date = "Unknown Date"
            
            # Clean quote text by removing <p> and </p> tags
            quote = row[4]
            cleaned_quote = re.sub(r'</?p>', '', quote) if quote else ""
                
            if formatted_date not in timeline_data:
                timeline_data[formatted_date] = []
            
            timeline_data[formatted_date].append({
                "id": row[0],
                "title": row[1],
                "source": row[2],
                "community": row[3],
                "quote": cleaned_quote,
                "sentiment": float(row[5]),
                "date": formatted_date,
                "url": row[7]
            })
        
        # Convert to list format
        timeline = []
        for date, perspectives in timeline_data.items():
            timeline.append({
                "date": date,
                "perspectives": perspectives
            })
        
        # Sort by date (newest first)
        timeline.sort(key=lambda x: x["date"], reverse=True)
        
        cursor.close()
        conn.close()
        
        return timeline
    
    except Exception as e:
        logger.error(f"Error fetching timeline: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching timeline: {str(e)}")

@app.get("/api/sources")
async def get_sources(query: str = Query(..., description="Search query")):
    """
    Get available sources for a search query
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        sql = """
            SELECT DISTINCT source
            FROM perspectives
            WHERE title ILIKE %s OR quote ILIKE %s
            ORDER BY source
        """
        params = [f"%{query}%", f"%{query}%"]
        
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        
        sources = [row[0] for row in rows]
        
        cursor.close()
        conn.close()
        
        return sources
    
    except Exception as e:
        logger.error(f"Error fetching sources: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching sources: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 