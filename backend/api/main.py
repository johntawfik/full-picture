import os
import time
import logging
import asyncpg
from typing import List
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from contextlib import asynccontextmanager

from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.decorator import cache
from redis import asyncio as aioredis


load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Redis cache
    redis_url = os.environ.get("REDIS_URL")
    redis = aioredis.from_url(redis_url)
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")
    
    # Initialize PostgreSQL connection pool
    db_url = os.environ.get("NEON_DB_URL")
    if not db_url:
        logger.error("NEON_DB_URL environment variable not set.")
        raise RuntimeError("Database URL not configured.")
    try:
        t1 = time.time()
        app.state.pool = await asyncpg.create_pool(
            dsn=db_url,
            min_size=1,
            max_size=10
        )
        logger.info("Database connection pool initialized.")
    except Exception as e:
        logger.error(f"Failed to initialize database pool: {e}")
        raise RuntimeError(f"Failed to initialize database pool: {e}")

    yield
    
    # Clean up the pool when the app shuts down
    if hasattr(app.state, 'pool') and app.state.pool:
        await app.state.pool.close()
        logger.info("Database connection pool closed.")


app = FastAPI(
    title="Full Picture API",
    description="API for retrieving news perspectives",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Perspective(BaseModel):
    id: str
    title: str
    source: str
    community: str
    quote: str
    sentiment: float
    date: str
    url: str


@app.get("/api/perspectives", response_model=List[Perspective])
@cache(expire=300) 
async def get_perspectives(
    query: str = Query(..., description="Search query for full-text search")
):
    """
    Get perspectives based on PostgreSQL Full-Text Search 
    across 'title' and 'quote' fields using asyncpg.
    Results are ranked by relevance.
    """
    try:
        # Start timing the overall request
        request_start_time = time.time()
        logger.info(f"Starting request for query: '{query}'")

        async with app.state.pool.acquire() as conn:
            # Start timing the database query
            db_start_time = time.time()
            
            sql = """
                SELECT 
                    id, title, source, community, quote, sentiment, 
                    SPLIT_PART(created_at::text, ' ', 1) as date, 
                    url,
                    ts_rank_cd(to_tsvector('english', title || ' ' || quote), plainto_tsquery('english', $1)) AS rank
                FROM perspectives
                WHERE to_tsvector('english', title || ' ' || quote) @@ plainto_tsquery('english', $1)
                ORDER BY rank DESC
            """
            
            # Execute the query using conn.fetch
            records = await conn.fetch(sql, query)
            
            # Log database query time
            db_end_time = time.time()
            db_query_time = db_end_time - db_start_time
            logger.info(f"Database query completed in {db_query_time:.4f} seconds")
            
            # Start timing the data processing
            processing_start_time = time.time()
            
            # Map asyncpg.Record objects to dictionaries
            perspectives = [
                {
                    "id": str(record["id"]),
                    "title": record["title"],
                    "source": record["source"],
                    "community": record["community"],
                    "quote": record["quote"],
                    "sentiment": float(record["sentiment"]),
                    "date": record["date"],
                    "url": record["url"]
                } for record in records
            ]
            
            # Log data processing time
            processing_end_time = time.time()
            processing_time = processing_end_time - processing_start_time
            logger.info(f"Data processing completed in {processing_time:.4f} seconds")
            
            # Log total request time
            request_end_time = time.time()
            total_request_time = request_end_time - request_start_time
            logger.info(f"Total request completed in {total_request_time:.4f} seconds")
            logger.info(f"Returning {len(perspectives)} perspectives")
            
        return perspectives
    
    except asyncpg.PostgresError as e:
        logger.error(f"Database query error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database query error: {str(e)}")
    except Exception as e:
        logger.error(f"Error fetching perspectives: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching perspectives: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 