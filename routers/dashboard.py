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

        # 4, 5, 6. Pending Operations Breakdown
        cur.execute("""
            SELECT 
                COUNT(*) FILTER (WHERE move_type = 'receipt' AND status IN ('draft', 'waiting', 'ready')) as receipts_to_receive,
                COUNT(*) FILTER (WHERE move_type = 'receipt' AND status != 'done' AND scheduled_date < CURRENT_DATE) as receipts_late,
                COUNT(*) FILTER (WHERE move_type = 'receipt' AND status != 'done' AND scheduled_date >= CURRENT_DATE) as receipts_operations,
                
                COUNT(*) FILTER (WHERE move_type = 'delivery' AND status IN ('draft', 'waiting', 'ready')) as deliveries_to_deliver,
                COUNT(*) FILTER (WHERE move_type = 'delivery' AND status != 'done' AND scheduled_date < CURRENT_DATE) as deliveries_late,
                COUNT(*) FILTER (WHERE move_type = 'delivery' AND status = 'waiting') as deliveries_waiting,
                COUNT(*) FILTER (WHERE move_type = 'delivery' AND status != 'done' AND scheduled_date >= CURRENT_DATE) as deliveries_operations,

                COUNT(*) FILTER (WHERE move_type = 'internal' AND status IN ('draft', 'waiting', 'ready')) as scheduled_transfers
            FROM stock_moves
        """)
        ops_stats = cur.fetchone()

        return {
            "total_products": total_products,
            "low_stock": stock_stats["low_stock"],
            "out_of_stock": stock_stats["out_of_stock"],
            "scheduled_transfers": ops_stats["scheduled_transfers"],
            "receipts": {
                "to_receive": ops_stats["receipts_to_receive"],
                "late": ops_stats["receipts_late"],
                "operations": ops_stats["receipts_operations"]
            },
            "deliveries": {
                "to_deliver": ops_stats["deliveries_to_deliver"],
                "late": ops_stats["deliveries_late"],
                "waiting": ops_stats["deliveries_waiting"],
                "operations": ops_stats["deliveries_operations"]
            }
        }
