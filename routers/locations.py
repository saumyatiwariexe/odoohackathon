from fastapi import APIRouter, Depends
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
from typing import Optional

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

router = APIRouter(prefix="/api/locations")

def get_db():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    try:
        yield conn
    finally:
        conn.close()

@router.get("/")
def get_locations(usage: Optional[str] = None, db=Depends(get_db)):
    query = """
        SELECT l.id, l.warehouse_id, 
               COALESCE(w.short_code || '/' || l.name, l.name) as name, 
               l.short_code, l.usage, l.created_at 
        FROM locations l
        LEFT JOIN warehouses w ON l.warehouse_id = w.id
        WHERE l.is_active = TRUE
    """
    params = []
    
    if usage:
        query += " AND l.usage = %s"
        params.append(usage)
        
    query += " ORDER BY name"
    
    with db.cursor() as cur:
        cur.execute(query, params)
        return cur.fetchall()
