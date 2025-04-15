import os
import logging
import psycopg2
from typing import List
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("api")

app = FastAPI(title="Full Picture API", description="API for retrieving news perspectives")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    try:
        conn = psycopg2.connect(os.environ["NEON_DB_URL"])
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        raise HTTPException(status_code=500, detail="Database connection error")

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

@app.get("/api/perspectives", response_model=List[Perspective])
async def get_perspectives(
    query: str = Query(..., description="Search query")
):
    """
    Get perspectives based on search query in title
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        sql = """
            SELECT id, title, source, community, quote, sentiment, 
                   SPLIT_PART(created_at::text, ' ', 1), url
            FROM perspectives
            WHERE title ILIKE %s
            ORDER BY created_at
        """
        params = [f"%{query}%"]
        
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        
        perspectives = []
        for row in rows:
            perspectives.append({
                "id": row[0],
                "title": row[1],
                "source": row[2],
                "community": row[3],
                "quote": row[4],
                "sentiment": float(row[5]),
                "date": row[6],
                "url": row[7]
            })
        
        cursor.close()
        conn.close()
        
        return perspectives
    
    except Exception as e:
        logger.error(f"Error fetching perspectives: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching perspectives: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 