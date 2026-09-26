from fastapi import APIRouter, Depends
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

router = APIRouter(prefix="/api/dashboard")

def get_db():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    try:
        yield conn
    finally:
        conn.close()

@router.get("/kpis")
def get_kpis(db=Depends(get_db)):
    with db.cursor() as cur:
        # 1. Total active products
        cur.execute("SELECT count(*) as total FROM products WHERE is_active = TRUE")
        total_products = cur.fetchone()["total"]

        # 2. Low Stock (Products where on_hand > 0 AND on_hand <= reorder_min)
        # 3. Out of Stock (Products where on_hand = 0)
        # We need to sum up on_hand from stock_quants grouped by product.
        cur.execute("""
            WITH ProductStock AS (
                SELECT p.id, p.reorder_min, COALESCE(SUM(sq.on_hand_qty), 0) as total_on_hand
                FROM products p
                LEFT JOIN stock_quants sq ON p.id = sq.product_id
                WHERE p.is_active = TRUE
                GROUP BY p.id, p.reorder_min
            )
            SELECT 
                COUNT(*) FILTER (WHERE total_on_hand > 0 AND total_on_hand <= reorder_min AND reorder_min > 0) as low_stock,
                COUNT(*) FILTER (WHERE total_on_hand = 0) as out_of_stock
            FROM ProductStock
        """)
        stock_stats = cur.fetchone()

        # 4, 5, 6. Pending Operations
        cur.execute("""
            SELECT 
                COUNT(*) FILTER (WHERE move_type = 'receipt') as pending_receipts,
                COUNT(*) FILTER (WHERE move_type = 'delivery') as pending_deliveries,
                COUNT(*) FILTER (WHERE move_type = 'internal') as scheduled_transfers
            FROM stock_moves
            WHERE status IN ('draft', 'waiting', 'ready')
        """)
        ops_stats = cur.fetchone()

        return {
            "total_products": total_products,
            "low_stock": stock_stats["low_stock"],
            "out_of_stock": stock_stats["out_of_stock"],
            "pending_receipts": ops_stats["pending_receipts"],
            "pending_deliveries": ops_stats["pending_deliveries"],
            "scheduled_transfers": ops_stats["scheduled_transfers"]
        }
