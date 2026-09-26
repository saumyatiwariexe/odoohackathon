import requests
import json
import time

BASE_URL = "http://127.0.0.1:3000/api"

def run_tests():
    print("--- 1. Fetching Categories ---")
    cats = requests.get(f"{BASE_URL}/categories").json()
    cat_id = cats[0]["id"]
    print(f"Using category: {cats[0]['name']} ({cat_id})")

    print("\n--- 2. Fetching Products ---")
    prods = requests.get(f"{BASE_URL}/products").json()
    if not prods:
        print("No products found, creating one...")
        prod = requests.post(f"{BASE_URL}/products", json={
            "sku": "TEST-100",
            "name": "Test Product",
            "category_id": cat_id,
            "uom": "pcs",
            "cost_per_unit": 10,
            "reorder_min": 5,
            "reorder_max": 20
        }).json()
        prod_id = prod["id"]
    else:
        prod_id = prods[0]["id"]
    print(f"Using product ID: {prod_id}")

    print("\n--- 3. Fetching Locations from DB directly ---")
    import psycopg2, os
    from psycopg2.extras import RealDictCursor
    from dotenv import load_dotenv
    load_dotenv()
    conn = psycopg2.connect(os.getenv("DATABASE_URL"), cursor_factory=RealDictCursor)
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM locations WHERE short_code = 'VENDOR'")
        vendor_loc = cur.fetchone()["id"]
        cur.execute("SELECT id FROM locations WHERE short_code = 'Stock'")
        stock_loc = cur.fetchone()["id"]
    conn.close()
    print(f"Vendor Loc: {vendor_loc}\nStock Loc: {stock_loc}")

    print("\n--- 4. Creating a Receipt Operation (Draft) ---")
    move_payload = {
        "move_type": "receipt",
        "source_location_id": vendor_loc,
        "dest_location_id": stock_loc,
        "contact": "Test Supplier",
        "notes": "Testing the API",
        "lines": [
            {"product_id": prod_id, "expected_qty": 50}
        ]
    }
    move_res = requests.post(f"{BASE_URL}/operations/", json=move_payload)
    print("Create Status:", move_res.status_code)
    move = move_res.json()
    print(json.dumps(move, indent=2))
    
    move_id = move["id"]

    print("\n--- 5. Validating the Receipt (Atomic Transaction) ---")
    val_payload = {
        "lines": [
            {"product_id": prod_id, "done_qty": 50}
        ]
    }
    val_res = requests.post(f"{BASE_URL}/operations/{move_id}/validate", json=val_payload)
    print("Validate Status:", val_res.status_code)
    print(json.dumps(val_res.json(), indent=2))

    print("\n--- 6. Checking Dashboard KPIs (Should see stock!) ---")
    time.sleep(1) # give it a moment
    kpis = requests.get(f"{BASE_URL}/dashboard/kpis").json()
    print(json.dumps(kpis, indent=2))

if __name__ == "__main__":
    run_tests()
