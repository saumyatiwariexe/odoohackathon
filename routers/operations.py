from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from typing import List, Optional
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

router = APIRouter(prefix="/api/operations")

def get_db():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    try:
        yield conn
    finally:
        conn.close()

# --- Schemas ---

class MoveLineCreate(BaseModel):
    product_id: str
    expected_qty: float

class MoveCreate(BaseModel):
    move_type: str # 'receipt', 'delivery', 'internal', 'adjustment'
    source_location_id: str
    dest_location_id: str
    contact: Optional[str] = None
    notes: Optional[str] = None
    lines: List[MoveLineCreate]

class ValidateLine(BaseModel):
    product_id: str
    done_qty: float

class MoveValidate(BaseModel):
    lines: List[ValidateLine]

# --- Routes ---

@router.get("/")
def get_operations(move_type: Optional[str] = None, status: Optional[str] = None, location_id: Optional[str] = None, category_id: Optional[str] = None, db=Depends(get_db)):
    query = """
        SELECT m.id, m.reference, m.move_type, m.status, m.contact, m.scheduled_date, 
               l_src.name as source_location, l_dest.name as dest_location
        FROM stock_moves m
        JOIN locations l_src ON m.source_location_id = l_src.id
        JOIN locations l_dest ON m.dest_location_id = l_dest.id
        WHERE 1=1
    """
    params = []
    if move_type:
        query += " AND m.move_type = %s"
        params.append(move_type)
    if status:
        query += " AND m.status = %s"
        params.append(status)
    if location_id:
        query += " AND (m.source_location_id = %s OR m.dest_location_id = %s)"
        params.extend([location_id, location_id])
    if category_id:
        query += """ AND EXISTS (
            SELECT 1 FROM stock_move_lines sml 
            JOIN products p ON sml.product_id = p.id 
            WHERE sml.stock_move_id = m.id AND p.category_id = %s
        )"""
        params.append(category_id)
        
    query += " ORDER BY m.created_at DESC"
    
    with db.cursor() as cur:
        cur.execute(query, params)
        return cur.fetchall()

@router.get("/{move_id}")
def get_operation(move_id: str, db=Depends(get_db)):
    with db.cursor() as cur:
        # Fetch move details
        cur.execute("""
            SELECT m.id, m.reference, m.move_type, m.status, m.contact, m.notes, m.scheduled_date,
                   l_src.name as source_location, l_dest.name as dest_location
            FROM stock_moves m
            JOIN locations l_src ON m.source_location_id = l_src.id
            JOIN locations l_dest ON m.dest_location_id = l_dest.id
            WHERE m.id = %s
        """, (move_id,))
        move = cur.fetchone()
        
        if not move:
            raise HTTPException(status_code=404, detail="Operation not found")
            
        # Fetch lines
        cur.execute("""
            SELECT l.id, l.product_id, p.name as product_name, p.sku, l.expected_qty, l.done_qty
            FROM stock_move_lines l
            JOIN products p ON l.product_id = p.id
            WHERE l.stock_move_id = %s
        """, (move_id,))
        move["lines"] = cur.fetchall()
        
        return move

@router.post("/")
def create_operation(move: MoveCreate, db=Depends(get_db)):
    if not move.lines:
        raise HTTPException(status_code=400, detail="An operation must have at least one line")
        
    try:
        with db.cursor() as cur:
            # 1. Validate move_type and Generate reference
            prefix_map = {"receipt": "IN", "delivery": "OUT", "internal": "INT", "adjustment": "ADJ"}
            if move.move_type not in prefix_map:
                raise HTTPException(status_code=400, detail="Invalid move type")
            
            prefix = prefix_map[move.move_type]
            seq_name = f"seq_move_{move.move_type}"
            cur.execute(f"SELECT nextval('{seq_name}')")
            seq_val = cur.fetchone()["nextval"]
            reference = f"{prefix}-{str(seq_val).zfill(5)}"
            
            # 2. Insert move
            cur.execute("""
                INSERT INTO stock_moves (reference, move_type, source_location_id, dest_location_id, contact, notes)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, reference
            """, (reference, move.move_type, move.source_location_id, move.dest_location_id, move.contact, move.notes))
            new_move = cur.fetchone()
            
            # 3. Insert lines
            for line in move.lines:
                cur.execute("""
                    INSERT INTO stock_move_lines (stock_move_id, product_id, expected_qty)
                    VALUES (%s, %s, %s)
                """, (new_move["id"], line.product_id, line.expected_qty))
                
            db.commit()
            return {"message": "Operation created", "reference": new_move["reference"], "id": new_move["id"]}
            
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{move_id}/validate")
def validate_operation(move_id: str, data: MoveValidate, db=Depends(get_db)):
    try:
        with db.cursor() as cur:
            # 1. Lock the move
            cur.execute("SELECT * FROM stock_moves WHERE id = %s FOR UPDATE", (move_id,))
            move = cur.fetchone()
            
            if not move:
                raise HTTPException(status_code=404, detail="Operation not found")
            if move["status"] == "done":
                raise HTTPException(status_code=400, detail="Operation is already validated")
                
            # Fetch location usages
            cur.execute("SELECT id, usage FROM locations WHERE id IN (%s, %s)", (move["source_location_id"], move["dest_location_id"]))
            locations = {r["id"]: r["usage"] for r in cur.fetchall()}
            src_usage = locations[move["source_location_id"]]
            dest_usage = locations[move["dest_location_id"]]

            # 2. Update done_qty on lines
            for line in data.lines:
                cur.execute("""
                    UPDATE stock_move_lines 
                    SET done_qty = %s 
                    WHERE stock_move_id = %s AND product_id = %s
                    RETURNING id
                """, (line.done_qty, move_id, line.product_id))
                
                updated_line = cur.fetchone()
                if not updated_line:
                    raise HTTPException(status_code=400, detail=f"Line for product {line.product_id} not found")
                
                # 3. Update stock_quants (Destination = +qty) - ONLY if internal
                dest_balance = 0
                if dest_usage == 'internal':
                    cur.execute("""
                        INSERT INTO stock_quants (product_id, location_id, on_hand_qty)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (product_id, location_id)
                        DO UPDATE SET on_hand_qty = stock_quants.on_hand_qty + EXCLUDED.on_hand_qty,
                                      updated_at = now()
                        RETURNING on_hand_qty
                    """, (line.product_id, move["dest_location_id"], line.done_qty))
                    dest_balance = cur.fetchone()["on_hand_qty"]
                
                # Insert Ledger (Destination)
                cur.execute("""
                    INSERT INTO stock_ledger (stock_move_id, stock_move_line_id, product_id, location_id, quantity_delta, balance_after)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (move_id, updated_line["id"], line.product_id, move["dest_location_id"], line.done_qty, dest_balance))

                # 4. Update stock_quants (Source = -qty) - ONLY if internal
                src_balance = 0
                if src_usage == 'internal':
                    cur.execute("""
                        INSERT INTO stock_quants (product_id, location_id, on_hand_qty)
                        VALUES (%s, %s, 0)
                        ON CONFLICT (product_id, location_id)
                        DO UPDATE SET on_hand_qty = stock_quants.on_hand_qty + %s,
                                      updated_at = now()
                        RETURNING on_hand_qty
                    """, (line.product_id, move["source_location_id"], -line.done_qty))
                    src_balance = cur.fetchone()["on_hand_qty"]
                
                # Insert Ledger (Source)
                cur.execute("""
                    INSERT INTO stock_ledger (stock_move_id, stock_move_line_id, product_id, location_id, quantity_delta, balance_after)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (move_id, updated_line["id"], line.product_id, move["source_location_id"], -line.done_qty, src_balance))
            
            # 5. Mark move as done
            cur.execute("""
                UPDATE stock_moves 
                SET status = 'done', done_date = %s, updated_at = %s
                WHERE id = %s
            """, (datetime.now(timezone.utc), datetime.now(timezone.utc), move_id))
            
            db.commit()
            return {"message": "Operation validated successfully"}
            
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
