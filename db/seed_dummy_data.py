import os
import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

db_url = os.getenv("DATABASE_URL")
if not db_url:
    db_url = "postgresql://stocksense:localpass@db:5432/stocksense"
DATABASE_URL = db_url

def hash_pw(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def seed_database():
    conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
    try:
        with conn.cursor() as cur:
            print("Cleaning up database tables...")
            # Truncate tables cleanly in order of dependencies
            cur.execute("""
                TRUNCATE stock_ledger, stock_move_lines, stock_moves, stock_quants, 
                         products, categories, locations, warehouses CASCADE;
            """)

            # ----------------------------------------------------
            # 1. USERS
            # ----------------------------------------------------
            print("Seeding Users...")
            default_pw_hash = hash_pw("Password123!")
            users_data = [
                ("admin@stocksense.com", "Admin User", default_pw_hash, "manager"),
                ("sarah.connor@stocksense.com", "Sarah Connor", default_pw_hash, "manager"),
                ("john.doe@stocksense.com", "John Doe", default_pw_hash, "staff"),
                ("alex.rivera@stocksense.com", "Alex Rivera", default_pw_hash, "staff"),
                ("samarpreetgaming2008@gmail.com", "Samarpreet Singh", default_pw_hash, "manager"),
                ("testuser@example.com", "Test User", default_pw_hash, "staff"),
            ]
            
            user_ids = {}
            for email, full_name, pw_hash, role in users_data:
                cur.execute("""
                    INSERT INTO users (email, full_name, password_hash, role)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (email) DO UPDATE 
                    SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, password_hash = EXCLUDED.password_hash
                    RETURNING id, email;
                """, (email, full_name, pw_hash, role))
                row = cur.fetchone()
                user_ids[email] = row["id"]

            admin_user_id = user_ids["admin@stocksense.com"]
            operator_user_id = user_ids["john.doe@stocksense.com"]

            # ----------------------------------------------------
            # 2. CATEGORIES
            # ----------------------------------------------------
            print("Seeding Categories...")
            categories_data = [
                "Electronics & Components",
                "Raw Materials",
                "Finished Goods",
                "Consumables",
                "Packaging",
                "Spare Parts"
            ]
            
            cat_ids = {}
            for cat_name in categories_data:
                cur.execute("""
                    INSERT INTO categories (name) VALUES (%s)
                    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                    RETURNING id, name;
                """, (cat_name,))
                row = cur.fetchone()
                cat_ids[cat_name] = row["id"]

            # ----------------------------------------------------
            # 3. WAREHOUSES & LOCATIONS
            # ----------------------------------------------------
            print("Seeding Warehouses & Locations...")
            
            # Virtual Locations
            vendor_loc = '00000000-0000-0000-0000-000000000001'
            customer_loc = '00000000-0000-0000-0000-000000000002'
            loss_loc = '00000000-0000-0000-0000-000000000003'

            cur.execute("""
                INSERT INTO locations (id, warehouse_id, name, short_code, usage) VALUES
                    (%s, NULL, 'Vendors',         'VENDOR',   'vendor'),
                    (%s, NULL, 'Customers',       'CUSTOMER', 'customer'),
                    (%s, NULL, 'Inventory Loss',  'LOSS',     'loss')
                ON CONFLICT (id) DO NOTHING;
            """, (vendor_loc, customer_loc, loss_loc))

            # Warehouses
            wh1_id = '10000000-0000-0000-0000-000000000001'
            wh2_id = '10000000-0000-0000-0000-000000000002'

            cur.execute("""
                INSERT INTO warehouses (id, name, short_code, address) VALUES
                    (%s, 'Main Warehouse', 'WH', '100 Logistics Blvd, Industrial Park'),
                    (%s, 'East Distribution Center', 'WH2', '45 Enterprise Way, East District')
                ON CONFLICT (id) DO NOTHING;
            """, (wh1_id, wh2_id))

            # Internal Locations
            wh_input   = '00000000-0000-0000-0000-100000000001'
            wh_quality = '00000000-0000-0000-0000-100000000002'
            wh_stock   = '00000000-0000-0000-0000-100000000003'
            wh_output  = '00000000-0000-0000-0000-100000000004'
            wh_rack_a  = '00000000-0000-0000-0000-100000000005'
            wh_rack_b  = '00000000-0000-0000-0000-100000000006'

            wh2_input  = '00000000-0000-0000-0000-200000000001'
            wh2_stock  = '00000000-0000-0000-0000-200000000002'
            wh2_output = '00000000-0000-0000-0000-200000000003'

            cur.execute("""
                INSERT INTO locations (id, warehouse_id, name, short_code, usage) VALUES
                    (%s, %s, 'Input Zone',   'Input',   'internal'),
                    (%s, %s, 'Quality Zone', 'Quality', 'internal'),
                    (%s, %s, 'Stock',        'Stock',   'internal'),
                    (%s, %s, 'Output Zone',  'Output',  'internal'),
                    (%s, %s, 'Rack A',       'RackA',   'internal'),
                    (%s, %s, 'Rack B',       'RackB',   'internal'),
                    (%s, %s, 'Input Zone',   'WH2-Input', 'internal'),
                    (%s, %s, 'Stock',        'WH2-Stock', 'internal'),
                    (%s, %s, 'Output Zone',  'WH2-Output','internal')
                ON CONFLICT (id) DO NOTHING;
            """, (
                wh_input, wh1_id,
                wh_quality, wh1_id,
                wh_stock, wh1_id,
                wh_output, wh1_id,
                wh_rack_a, wh1_id,
                wh_rack_b, wh1_id,
                wh2_input, wh2_id,
                wh2_stock, wh2_id,
                wh2_output, wh2_id
            ))

            # ----------------------------------------------------
            # 4. PRODUCTS
            # ----------------------------------------------------
            print("Seeding Products...")
            products_spec = [
                ("ELE-101", "Intel Core i7-13700K Processor", "Electronics & Components", "pcs", 380.00, 10, 50),
                ("ELE-102", "NVIDIA GeForce RTX 4080 GPU", "Electronics & Components", "pcs", 1199.00, 5, 20),
                ("ELE-103", "Corsair Vengeance DDR5 32GB RAM", "Electronics & Components", "pcs", 125.00, 15, 60),
                ("ELE-104", "Samsung 990 Pro 2TB NVMe SSD", "Electronics & Components", "pcs", 170.00, 12, 40),
                ("RAW-201", "Aluminum Alloy Sheet 4x8ft", "Raw Materials", "pcs", 65.00, 25, 100),
                ("RAW-202", "Stainless Steel Rod 20mm x 3m", "Raw Materials", "pcs", 42.50, 20, 80),
                ("RAW-203", "Industrial Copper Wire (100m spool)", "Raw Materials", "m", 88.00, 30, 150),
                ("FG-301", "StockSense Handheld Terminal Scanner", "Finished Goods", "pcs", 450.00, 8, 30),
                ("FG-302", "Wireless Barcode Scanner Pro", "Finished Goods", "pcs", 185.00, 10, 40),
                ("FG-303", "Automated RFID Dock Reader Hub", "Finished Goods", "pcs", 890.00, 3, 15),
                ("CON-401", "Thermal Shipping Label Roll (Box of 50)", "Consumables", "box", 32.00, 15, 50),
                ("CON-402", "Industrial Stretch Wrap Roll 500mm", "Consumables", "pcs", 14.50, 40, 150),
                ("PKG-501", "Heavy-Duty Corrugated Shipping Box XL", "Packaging", "pcs", 2.20, 100, 500),
                ("PKG-502", "Biodegradable Bubble Wrap Spool 100m", "Packaging", "pcs", 28.00, 10, 40),
                ("SPR-601", "High Torque Servo Motor 400W", "Spare Parts", "pcs", 140.00, 4, 15),
                ("SPR-602", "Conveyor Belt Heavy Duty Rubber (5m)", "Spare Parts", "m", 95.00, 15, 60),
            ]

            prod_ids = {}
            for sku, name, cat_name, uom, cost, rmin, rmax in products_spec:
                cat_id = cat_ids[cat_name]
                cur.execute("""
                    INSERT INTO products (sku, name, category_id, uom, cost_per_unit, reorder_min, reorder_max)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (sku) DO UPDATE 
                    SET name=EXCLUDED.name, category_id=EXCLUDED.category_id, cost_per_unit=EXCLUDED.cost_per_unit,
                        reorder_min=EXCLUDED.reorder_min, reorder_max=EXCLUDED.reorder_max
                    RETURNING id;
                """, (sku, name, cat_id, uom, cost, rmin, rmax))
                prod_ids[sku] = cur.fetchone()["id"]

            # Reset sequence counters
            cur.execute("ALTER SEQUENCE seq_move_receipt RESTART WITH 1;")
            cur.execute("ALTER SEQUENCE seq_move_delivery RESTART WITH 1;")
            cur.execute("ALTER SEQUENCE seq_move_internal RESTART WITH 1;")
            cur.execute("ALTER SEQUENCE seq_move_adjustment RESTART WITH 1;")

            now = datetime.now(timezone.utc)
            days_ago = lambda d: now - timedelta(days=d)
            days_hence = lambda d: now + timedelta(days=d)

            # Helper to create and validate moves
            def create_move(ref, move_type, status, src_id, dest_id, contact, notes, sched_date, done_date, lines):
                cur.execute("""
                    INSERT INTO stock_moves (reference, move_type, status, source_location_id, dest_location_id, contact, notes, responsible_user_id, scheduled_date, done_date, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING id;
                """, (ref, move_type, status, src_id, dest_id, contact, notes, operator_user_id, sched_date, done_date, sched_date or now))
                move_id = cur.fetchone()["id"]

                # Get usages
                cur.execute("SELECT id, usage FROM locations WHERE id IN (%s, %s)", (src_id, dest_id))
                usages = {str(r["id"]): r["usage"] for r in cur.fetchall()}
                src_usage = usages[str(src_id)]
                dest_usage = usages[str(dest_id)]
                print(f"Move {ref} ({move_type}, status={status}): src={src_usage}, dest={dest_usage}")

                for prod_sku, exp_qty, done_qty in lines:
                    print(f"  Line {prod_sku}: exp={exp_qty}, done={done_qty}")
                    pid = prod_ids[prod_sku]
                    cur.execute("""
                        INSERT INTO stock_move_lines (stock_move_id, product_id, expected_qty, done_qty)
                        VALUES (%s, %s, %s, %s)
                        RETURNING id;
                    """, (move_id, pid, exp_qty, done_qty))
                    line_id = cur.fetchone()["id"]

                    if status == 'done':
                        # Update dest quant & ledger
                        dest_bal = 0
                        if dest_usage == 'internal':
                            cur.execute("""
                                INSERT INTO stock_quants (product_id, location_id, on_hand_qty)
                                VALUES (%s, %s, %s)
                                ON CONFLICT (product_id, location_id)
                                DO UPDATE SET on_hand_qty = stock_quants.on_hand_qty + EXCLUDED.on_hand_qty, updated_at = now()
                                RETURNING on_hand_qty;
                            """, (pid, dest_id, done_qty))
                            dest_bal = cur.fetchone()["on_hand_qty"]
                            print(f"    [DEST QUANT] Prod {prod_sku} at {dest_id}: +{done_qty} -> new bal={dest_bal}")

                        cur.execute("""
                            INSERT INTO stock_ledger (stock_move_id, stock_move_line_id, product_id, location_id, quantity_delta, balance_after, created_at)
                            VALUES (%s, %s, %s, %s, %s, %s, %s);
                        """, (move_id, line_id, pid, dest_id, done_qty, dest_bal, done_date or now))

                        # Update src quant & ledger
                        src_bal = 0
                        if src_usage == 'internal':
                            cur.execute("""
                                INSERT INTO stock_quants (product_id, location_id, on_hand_qty)
                                VALUES (%s, %s, 0)
                                ON CONFLICT (product_id, location_id)
                                DO UPDATE SET on_hand_qty = stock_quants.on_hand_qty + %s, updated_at = now()
                                RETURNING on_hand_qty;
                            """, (pid, src_id, -done_qty))
                            src_bal = cur.fetchone()["on_hand_qty"]
                            print(f"    [SRC QUANT] Prod {prod_sku} at {src_id}: -{done_qty} -> new bal={src_bal}")

                        cur.execute("""
                            INSERT INTO stock_ledger (stock_move_id, stock_move_line_id, product_id, location_id, quantity_delta, balance_after, created_at)
                            VALUES (%s, %s, %s, %s, %s, %s, %s);
                        """, (move_id, line_id, pid, src_id, -done_qty, src_bal, done_date or now))

            # ----------------------------------------------------
            # 5. HISTORICAL VALIDATED OPERATIONS (POPULATE STOCK & LEDGER)
            # ----------------------------------------------------
            print("Seeding Stock Operations & Ledger...")

            # IN-00001 (7 days ago)
            create_move(
                "IN-00001", "receipt", "done", vendor_loc, wh_stock,
                "Acme Components Ltd", "Initial stock intake",
                days_ago(7), days_ago(7),
                [("ELE-101", 40, 40), ("ELE-103", 50, 50), ("ELE-104", 30, 30)]
            )
            cur.execute("SELECT setval('seq_move_receipt', 1);")

            # IN-00002 (5 days ago)
            create_move(
                "IN-00002", "receipt", "done", vendor_loc, wh_stock,
                "Global Metals Inc", "Raw material batch supply",
                days_ago(5), days_ago(5),
                [("RAW-201", 80, 80), ("RAW-202", 60, 60), ("RAW-203", 100, 100)]
            )
            cur.execute("SELECT setval('seq_move_receipt', 2);")

            # IN-00003 (3 days ago)
            create_move(
                "IN-00003", "receipt", "done", vendor_loc, wh_stock,
                "LogiPack Supplies", "Packaging and consumables shipment",
                days_ago(3), days_ago(3),
                [("CON-401", 40, 40), ("CON-402", 120, 120), ("PKG-501", 350, 350)]
            )
            cur.execute("SELECT setval('seq_move_receipt', 3);")

            # IN-00004 (1 day ago)
            create_move(
                "IN-00004", "receipt", "done", vendor_loc, wh_input,
                "Apex Tech Ltd", "Finished goods arrival",
                days_ago(1), days_ago(1),
                [("FG-301", 20, 20), ("FG-302", 25, 25), ("SPR-601", 10, 10)]
            )
            cur.execute("SELECT setval('seq_move_receipt', 4);")

            # ADJ-00001 (6 days ago)
            create_move(
                "ADJ-00001", "adjustment", "done", loss_loc, wh_stock,
                "System Audit", "Opening stock adjustment for specialized items",
                days_ago(6), days_ago(6),
                [("ELE-102", 12, 12), ("FG-303", 5, 5)]
            )
            cur.execute("SELECT setval('seq_move_adjustment', 1);")

            # INT-00001 (4 days ago)
            create_move(
                "INT-00001", "internal", "done", wh_stock, wh_rack_a,
                "Warehouse Team", "Transfer high demand processors to Rack A",
                days_ago(4), days_ago(4),
                [("ELE-101", 20, 20), ("ELE-104", 15, 15)]
            )
            cur.execute("SELECT setval('seq_move_internal', 1);")

            # INT-00002 (1 day ago)
            create_move(
                "INT-00002", "internal", "done", wh_input, wh_stock,
                "QC Team", "Passed inspection, move to main stock",
                days_ago(1), days_ago(1),
                [("FG-301", 20, 20), ("FG-302", 25, 25)]
            )
            cur.execute("SELECT setval('seq_move_internal', 2);")

            # OUT-00001 (2 days ago)
            create_move(
                "OUT-00001", "delivery", "done", wh_stock, customer_loc,
                "TechCorp Solutions", "Outbound order #4081",
                days_ago(2), days_ago(2),
                [("ELE-101", 15, 15), ("ELE-103", 20, 20)]
            )
            cur.execute("SELECT setval('seq_move_delivery', 1);")

            # OUT-00002 (1 day ago - triggers RAW-202 to low stock!)
            create_move(
                "OUT-00002", "delivery", "done", wh_stock, customer_loc,
                "BuildRight Industrial", "Construction materials dispatch",
                days_ago(1), days_ago(1),
                [("RAW-201", 40, 40), ("RAW-202", 55, 55)]
            )
            cur.execute("SELECT setval('seq_move_delivery', 2);")

            # ----------------------------------------------------
            # 6. PENDING & SCHEDULED OPERATIONS (FOR DASHBOARD & FILTERS)
            # ----------------------------------------------------
            # IN-00005 (LATE RECEIPT)
            create_move(
                "IN-00005", "receipt", "ready", vendor_loc, wh_input,
                "Silicon Dynamics", "High performance GPU restock",
                days_ago(2), None,
                [("ELE-102", 10, 0)]
            )
            cur.execute("SELECT setval('seq_move_receipt', 5);")

            # IN-00006 (UPCOMING RECEIPT - WAITING)
            create_move(
                "IN-00006", "receipt", "waiting", vendor_loc, wh_input,
                "Global Metals Inc", "Stainless steel restock",
                days_hence(1), None,
                [("RAW-202", 50, 0)]
            )
            cur.execute("SELECT setval('seq_move_receipt', 6);")

            # IN-00007 (DRAFT RECEIPT)
            create_move(
                "IN-00007", "receipt", "draft", vendor_loc, wh_input,
                "RubberTech Spares", "Conveyor belt replacement order",
                days_hence(3), None,
                [("SPR-602", 20, 0)]
            )
            cur.execute("SELECT setval('seq_move_receipt', 7);")

            # OUT-00003 (LATE DELIVERY)
            create_move(
                "OUT-00003", "delivery", "ready", wh_stock, customer_loc,
                "Metro Retailers", "Urgent terminal dispatch",
                days_ago(1), None,
                [("FG-301", 5, 0)]
            )
            cur.execute("SELECT setval('seq_move_delivery', 3);")

            # OUT-00004 (WAITING DELIVERY)
            create_move(
                "OUT-00004", "delivery", "waiting", wh_stock, customer_loc,
                "Nexus Logistics", "RAM components customer order",
                now, None,
                [("ELE-103", 10, 0)]
            )
            cur.execute("SELECT setval('seq_move_delivery', 4);")

            # OUT-00005 (DRAFT DELIVERY)
            create_move(
                "OUT-00005", "delivery", "draft", wh_stock, customer_loc,
                "Quantum Systems", "SSD Bulk Order",
                days_hence(2), None,
                [("ELE-104", 8, 0)]
            )
            cur.execute("SELECT setval('seq_move_delivery', 5);")

            # INT-00003 (READY INTERNAL TRANSFER)
            create_move(
                "INT-00003", "internal", "ready", wh_stock, wh2_stock,
                "Inter-warehouse Transfer", "Transfer labels to Secondary Hub",
                now, None,
                [("CON-401", 10, 0)]
            )
            cur.execute("SELECT setval('seq_move_internal', 3);")

            conn.commit()
            print("Successfully seeded all dummy data into StockSense!")

    except Exception as e:
        conn.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    seed_database()
