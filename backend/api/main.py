import os
import time
import logging
import asyncpg
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import uuid

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
    comment_count: int = 0


class Comment(BaseModel):
    id: Optional[str] = None
    perspective_id: str
    content: str
    created_at: Optional[str] = None


class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=500)


@app.get("/api/perspectives", response_model=List[Perspective])
@cache(expire=300) 
async def get_perspectives(
    query: str = Query(..., description="Search query for full-text search")
):
    """
    Get perspectives based on PostgreSQL Full-Text Search 
    across 'title' and 'quote' fields using asyncpg.
    Results are ranked by relevance and include comment counts.
    """
    try:
        logger.info(f"Starting request for query: '{query}'")

        async with app.state.pool.acquire() as conn:
            sql = """
                SELECT 
                    p.id, p.title, p.source, p.community, p.quote, p.sentiment, 
                    SPLIT_PART(p.created_at::text, ' ', 1) as date, 
                    p.url,
                    COALESCE(COUNT(c.id), 0) as comment_count,
                    ts_rank_cd(to_tsvector('english', p.title || ' ' || p.quote), plainto_tsquery('english', $1)) AS rank
                FROM perspectives p
                LEFT JOIN comments c ON p.id = c.perspective_id
                WHERE to_tsvector('english', p.title || ' ' || p.quote) @@ plainto_tsquery('english', $1)
                GROUP BY p.id, p.title, p.source, p.community, p.quote, p.sentiment, p.created_at, p.url
                ORDER BY rank DESC
            """
            
            records = await conn.fetch(sql, query)
            
            perspectives = [
                {
                    "id": str(record["id"]),
                    "title": record["title"],
                    "source": record["source"],
                    "community": record["community"],
                    "quote": record["quote"],
                    "sentiment": float(record["sentiment"]),
                    "date": record["date"],
                    "url": record["url"],
                    "comment_count": int(record["comment_count"])
                } for record in records
            ]
            
            return perspectives
    
    except asyncpg.PostgresError as e:
        logger.error(f"Database query error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database query error: {str(e)}")
    except Exception as e:
        logger.error(f"Error fetching perspectives: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching perspectives: {str(e)}")


@app.get("/api/perspectives/{perspective_id}/comments", response_model=List[Comment])
async def get_comments(perspective_id: str):
    """
    Get all comments for a specific perspective
    """
    try:
        async with app.state.pool.acquire() as conn:
            sql = """
                SELECT id, perspective_id, content, created_at
                FROM comments
                WHERE perspective_id = $1
                ORDER BY created_at DESC
            """
            
            records = await conn.fetch(sql, perspective_id)
            
            comments = [
                {
                    "id": str(record["id"]),
                    "perspective_id": str(record["perspective_id"]),
                    "content": record["content"],
                    "created_at": record["created_at"].isoformat() if record["created_at"] else None
                } for record in records
            ]
            
            return comments
    
    except asyncpg.PostgresError as e:
        logger.error(f"Database query error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database query error: {str(e)}")
    except Exception as e:
        logger.error(f"Error fetching comments: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching comments: {str(e)}")


@app.post("/api/perspectives/{perspective_id}/comments", response_model=Comment)
async def create_comment(perspective_id: str, comment: CommentCreate = Body(...)):
    """
    Create a new comment for a specific perspective
    """
    try:
        # Validate that the perspective exists
        async with app.state.pool.acquire() as conn:
            perspective = await conn.fetchrow(
                "SELECT id FROM perspectives WHERE id = $1", perspective_id
            )
            
            if not perspective:
                raise HTTPException(status_code=404, detail="Perspective not found")
            
            # Generate a UUID for the comment
            comment_id = str(uuid.uuid4())
            
            # Insert the comment
            sql = """
                INSERT INTO comments (id, perspective_id, content)
                VALUES ($1, $2, $3)
                RETURNING id, perspective_id, content, created_at
            """
            
            record = await conn.fetchrow(
                sql, comment_id, perspective_id, comment.content
            )
            
            return {
                "id": str(record["id"]),
                "perspective_id": str(record["perspective_id"]),
                "content": record["content"],
                "created_at": record["created_at"].isoformat() if record["created_at"] else None
            }
    
    except asyncpg.PostgresError as e:
        logger.error(f"Database query error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database query error: {str(e)}")
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating comment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating comment: {str(e)}")


@app.get("/api/recent", response_model=List[Perspective])
@cache(expire=300)
async def get_recent_perspectives():
    """
    Get the most recent perspectives from each community (right, center, left)
    including comment counts
    """
    try:
        logger.info("Starting request for recent perspectives")

        async with app.state.pool.acquire() as conn:
            sql = """
                WITH RankedPerspectives AS (
                    SELECT 
                        p.id, p.title, p.source, p.community, p.quote, p.sentiment,
                        SPLIT_PART(p.created_at::text, ' ', 1) as date,
                        p.url,
                        COALESCE(COUNT(c.id), 0) as comment_count,
                        ROW_NUMBER() OVER (PARTITION BY p.community ORDER BY p.created_at DESC) as rn
                    FROM perspectives p
                    LEFT JOIN comments c ON p.id = c.perspective_id
                    WHERE p.community IN ('right', 'center', 'left')
                    GROUP BY p.id, p.title, p.source, p.community, p.quote, p.sentiment, p.created_at, p.url
                )
                SELECT id, title, source, community, quote, sentiment, date, url, comment_count
                FROM RankedPerspectives
                WHERE rn <= 4
                ORDER BY community, date DESC;
            """
            
            records = await conn.fetch(sql)
            
            perspectives = [
                {
                    "id": str(record["id"]),
                    "title": record["title"],
                    "source": record["source"],
                    "community": record["community"],
                    "quote": record["quote"],
                    "sentiment": float(record["sentiment"]),
                    "date": record["date"],
                    "url": record["url"],
                    "comment_count": int(record["comment_count"])
                } for record in records
            ]
            
            logger.info(f"Returning {len(perspectives)} perspectives")
            return perspectives
    
    except asyncpg.PostgresError as e:
        logger.error(f"Database query error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database query error: {str(e)}")
    except Exception as e:
        logger.error(f"Error fetching recent perspectives: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching recent perspectives: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 