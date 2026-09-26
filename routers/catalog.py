import os
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

router = APIRouter(prefix="/api")

def get_db():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    try:
        yield conn
    finally:
        conn.close()

# --- Schemas ---

class CategoryCreate(BaseModel):
    name: str

class ProductCreate(BaseModel):
    sku: str
    name: str
    category_id: Optional[str] = None
    uom: str = "pcs"
    cost_per_unit: Optional[float] = None
    reorder_min: float = 0
    reorder_max: float = 0

# --- Categories ---

@router.get("/categories")
def get_categories(db=Depends(get_db)):
    with db.cursor() as cur:
        cur.execute("SELECT id, name, created_at FROM categories ORDER BY name")
        return cur.fetchall()

@router.post("/categories")
def create_category(cat: CategoryCreate, db=Depends(get_db)):
    try:
        with db.cursor() as cur:
            cur.execute(
                "INSERT INTO categories (name) VALUES (%s) RETURNING id, name",
                (cat.name,)
            )
            new_cat = cur.fetchone()
            db.commit()
            return new_cat
    except psycopg2.IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Category with this name already exists")

# --- Products ---

@router.get("/products")
def get_products(db=Depends(get_db)):
    with db.cursor() as cur:
        # We join categories to get the category name along with the product
        cur.execute("""
            SELECT p.id, p.sku, p.name, p.category_id, c.name as category_name, 
                   p.uom, p.cost_per_unit, p.reorder_min, p.reorder_max, p.is_active
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = TRUE
            ORDER BY p.name
        """)
        return cur.fetchall()

@router.post("/products")
def create_product(prod: ProductCreate, db=Depends(get_db)):
    # Validate threshold logic
    if prod.reorder_max < prod.reorder_min:
        raise HTTPException(status_code=400, detail="reorder_max cannot be less than reorder_min")

    try:
        with db.cursor() as cur:
            cur.execute("""
                INSERT INTO products (sku, name, category_id, uom, cost_per_unit, reorder_min, reorder_max)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id, sku, name
            """, (prod.sku, prod.name, prod.category_id, prod.uom, prod.cost_per_unit, prod.reorder_min, prod.reorder_max))
            new_prod = cur.fetchone()
            db.commit()
            return new_prod
    except psycopg2.IntegrityError as e:
        db.rollback()
        if "products_sku_unique" in str(e):
            raise HTTPException(status_code=409, detail="Product with this SKU already exists")
        raise HTTPException(status_code=400, detail="Invalid data or missing category")
