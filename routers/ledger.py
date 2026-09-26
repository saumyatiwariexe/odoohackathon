from fastapi import APIRouter, Depends
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

router = APIRouter(prefix="/api/ledger")

def get_db():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    try:
        yield conn
    finally:
        conn.close()

@router.get("/")
def get_ledger(db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("""
            SELECT 
                l.id, 
                l.created_at as timestamp, 
                m.reference as operation_ref,
                m.move_type,
                p.name as product_name,
                loc.name as location,
                l.quantity_delta,
                l.balance_after
            FROM stock_ledger l
            JOIN stock_moves m ON l.stock_move_id = m.id
            JOIN products p ON l.product_id = p.id
            JOIN locations loc ON l.location_id = loc.id
            ORDER BY l.created_at DESC
        """)
        return cur.fetchall()
