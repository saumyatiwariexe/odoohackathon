StockSense – Database Schema
Sep 26, 2026 · @SAM
This is the PostgreSQL schema for StockSense, run locally (per the PRD's non-functional requirements). Related: Document, Document (covers the users and password_resets tables), Document.
Overview & Design Principle
One design decision drives this schema: Receipts, Deliveries, Internal Transfers, and Adjustments are all the same kind of row — a move of a quantity of a product from one location to another. A receipt's source is a virtual “Vendor” location; a delivery's destination is a virtual “Customer” location; an adjustment's counterpart is a virtual “Inventory Loss/Gain” location. This is why there's one stock_moves table instead of four near-duplicate tables — it also makes Move History trivial (it's just a read of the ledger, no cross-table unioning).
Stock only changes, and only gets logged, when a move reaches status Done — see the Auth Spec's linked PRD for the full state machine.
Catalog Tables
categories
  id            uuid, pk
  name          text, not null

products
  id            uuid, pk
  sku           text, unique, not null
  name          text, not null
  category_id   uuid, fk -> categories.id
  uom           text                -- unit of measure: pcs, kg, ltr, etc.
  cost_per_unit numeric(12,2)
  reorder_min   numeric             -- triggers "low stock" alert
  reorder_max   numeric             -- target restock level
  created_at    timestamptz
Location Hierarchy
warehouses
  id           uuid, pk
  name         text, not null
  short_code   text, unique       -- e.g. "WH"
  address      text

locations
  id           uuid, pk
  warehouse_id uuid, fk -> warehouses.id
  name         text, not null
  short_code   text               -- e.g. "Stock1", combined in UI as WH/Stock1
Two virtual locations are seeded once at setup and never edited by users: a Vendor location (source for all receipts) and a Customer location (destination for all deliveries). Adjustments reference a real location plus an implicit inventory-loss/gain counterpart handled in code, not a user-facing row.
Stock State
stock_quants
  id             uuid, pk
  product_id     uuid, fk -> products.id
  location_id    uuid, fk -> locations.id
  on_hand_qty    numeric, not null, default 0
  reserved_qty   numeric, not null, default 0
  unique(product_id, location_id)
free_to_use = on_hand_qty - reserved_qty, computed at read time (matches the wireframe's Stock table columns: Product, Per-Unit Cost, On Hand, Free to Use). This table is a cache of current state derived from stock_ledger — it's what the UI reads for speed, but stock_ledger is the source of truth if the two ever disagree.
Operations Tables
stock_moves
  id                  uuid, pk
  reference           text, unique       -- e.g. WH/IN/0001, WH/OUT/0001
  move_type           enum('receipt','delivery','internal','adjustment')
  status              enum('draft','waiting','ready','done','cancelled')
  source_location_id  uuid, fk -> locations.id   -- null only conceptually; Vendor row used for receipts
  dest_location_id    uuid, fk -> locations.id   -- Customer row used for deliveries
  contact             text               -- vendor/customer name
  responsible_user_id uuid, fk -> users.id
  scheduled_date      timestamptz
  done_date           timestamptz, nullable
  created_at          timestamptz

stock_move_lines
  id             uuid, pk
  stock_move_id  uuid, fk -> stock_moves.id
  product_id     uuid, fk -> products.id
  quantity       numeric, not null
One stock_moves row can have many stock_move_lines — this is what supports “a single reference with multiple products displayed as multiple rows” from the wireframe.
Ledger Table
stock_ledger
  id             uuid, pk
  stock_move_id  uuid, fk -> stock_moves.id
  product_id     uuid, fk -> products.id
  location_id    uuid, fk -> locations.id
  quantity_delta numeric, not null      -- signed: +50 for a receipt, -20 for a delivery
  balance_after  numeric, not null
  created_at     timestamptz, not null
Immutable by convention: rows are inserted only, never updated or deleted, written exactly once inside the same transaction that flips a stock_moves row to done and updates stock_quants. This is the Move History screen's data source and the system's full audit trail (matches the PDF's “Everything logged in the Stock Ledger” requirement).
Relationships & Constraints
From
To
Nature
locations
warehouses
many-to-one
products
categories
many-to-one
stock_quants
products, locations
many-to-one each, unique pair
stock_move_lines
stock_moves, products
many-to-one each
stock_ledger
stock_moves, products, locations
many-to-one each
stock_moves
users (responsible)
many-to-one
Key constraints:
• stock_moves.reference unique, generated server-side (never client-supplied) as <warehouse_short_code>/<IN|OUT|INT|ADJ>/<zero-padded sequence>.
• Validating a move (status → done) must be one DB transaction: insert stock_ledger row(s), upsert stock_quants, update stock_moves.status and done_date — all or nothing, so a crash mid-validate never leaves stock and ledger out of sync.
• Per the PRD's stock-blocking rule: the validate transaction for a delivery or internal move must check stock_quants.on_hand_qty - reserved_qty >= requested quantity for every line and reject (no partial commit) if any line fails.