# StockSense — Database Schema

> **Author:** @SAM · **Updated:** 2026-09-26  
> **Engine:** PostgreSQL 15 (local via Docker)  
> **Related:** [Auth.md](./Auth.md) · [PRD.md](./PRD.md) · [docker-compose.yml](../docker-compose.yml)

---

## Design Principle

One decision drives the entire schema: **all stock operations are the same thing** — moving a quantity of a product from one location to another.

| Operation | Source Location | Destination Location |
|-----------|----------------|---------------------|
| Receipt | Virtual: `VENDOR` | Real warehouse location |
| Delivery | Real warehouse location | Virtual: `CUSTOMER` |
| Internal Transfer | Real location A | Real location B |
| Adjustment | Virtual: `INVENTORY_LOSS` (if loss) | Real location (if gain) |

This is why there is **one `stock_moves` table** instead of four near-duplicate tables. Move History is then just a read of `stock_ledger` with no cross-table UNIONs.

> **Rule:** Stock only changes (and only gets logged to `stock_ledger`) when a move reaches status `done`. Everything before that is planning/reservation only.

---

## Table Reference

### 1. Catalog

#### `categories`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `name` | `text` | NOT NULL, UNIQUE |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

#### `products`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK |
| `sku` | `text` | UNIQUE, NOT NULL |
| `name` | `text` | NOT NULL |
| `category_id` | `uuid` | FK → `categories.id` |
| `uom` | `text` | NOT NULL — `pcs`, `kg`, `ltr`, etc. |
| `cost_per_unit` | `numeric(12,2)` | nullable |
| `reorder_min` | `numeric` | triggers low-stock alert |
| `reorder_max` | `numeric` | target restock level |
| `is_active` | `boolean` | NOT NULL, default `true` (soft-delete) |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

---

### 2. Location Hierarchy

#### `warehouses`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK |
| `name` | `text` | NOT NULL, UNIQUE |
| `short_code` | `text` | UNIQUE — e.g. `WH` |
| `address` | `text` | nullable |

#### `locations`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK |
| `warehouse_id` | `uuid` | FK → `warehouses.id`, nullable (virtual locations have no warehouse) |
| `name` | `text` | NOT NULL |
| `short_code` | `text` | e.g. `Stock` → displayed as `WH/Stock` |
| `usage` | `text` | `internal` \| `vendor` \| `customer` \| `loss` — default `internal` |
| `is_active` | `boolean` | NOT NULL, default `true` |

> **Seeded virtual locations (created once, never user-editable):**
> - `VENDOR` (usage = `vendor`) — source for all receipts
> - `CUSTOMER` (usage = `customer`) — destination for all deliveries  
> - `INVENTORY_LOSS` (usage = `loss`) — counterpart for negative adjustments

---

### 3. Stock State

#### `stock_quants`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK |
| `product_id` | `uuid` | FK → `products.id` |
| `location_id` | `uuid` | FK → `locations.id` |
| `on_hand_qty` | `numeric` | NOT NULL, default `0` |
| `reserved_qty` | `numeric` | NOT NULL, default `0` |
| — | — | UNIQUE(`product_id`, `location_id`) |

**Computed at read time:** `free_to_use = on_hand_qty - reserved_qty`

> `stock_quants` is a **cache** updated atomically on every validated move. `stock_ledger` is the source of truth — if they ever diverge, re-derive quants from the ledger.

---

### 4. Operations

#### `stock_moves` (one row per operation document)
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK |
| `reference` | `text` | UNIQUE, server-generated — e.g. `WH/IN/0001` |
| `move_type` | `text` | `receipt` \| `delivery` \| `internal` \| `adjustment` |
| `status` | `text` | `draft` \| `waiting` \| `ready` \| `done` \| `cancelled` |
| `source_location_id` | `uuid` | FK → `locations.id` |
| `dest_location_id` | `uuid` | FK → `locations.id` |
| `contact` | `text` | vendor or customer name |
| `responsible_user_id` | `uuid` | FK → `users.id` |
| `scheduled_date` | `timestamptz` | nullable |
| `done_date` | `timestamptz` | nullable — set when status → `done` |
| `notes` | `text` | nullable |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

#### `stock_move_lines` (one row per product line within a move)
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK |
| `stock_move_id` | `uuid` | FK → `stock_moves.id` ON DELETE CASCADE |
| `product_id` | `uuid` | FK → `products.id` |
| `expected_qty` | `numeric` | NOT NULL — planned quantity |
| `done_qty` | `numeric` | NOT NULL, default `0` — filled in on validate |

> One `stock_moves` row → many `stock_move_lines` — this is what shows multiple product rows under a single reference number in the UI.

---

### 5. Ledger (Append-Only Audit Log)

#### `stock_ledger`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK |
| `stock_move_id` | `uuid` | FK → `stock_moves.id` |
| `product_id` | `uuid` | FK → `products.id` |
| `location_id` | `uuid` | FK → `locations.id` |
| `quantity_delta` | `numeric` | NOT NULL — signed: `+50` receipt, `-20` delivery |
| `balance_after` | `numeric` | NOT NULL — running balance at this location after the move |
| `created_at` | `timestamptz` | NOT NULL, default `now()` |

> **Immutable:** rows are INSERT-only, never UPDATE or DELETE.  
> Written in the same transaction that flips `stock_moves.status → done` and updates `stock_quants`.  
> This table is the data source for the Move History screen and the full audit trail.

---

## Relationships

| From | To | Type |
|------|----|------|
| `locations` | `warehouses` | many → one |
| `products` | `categories` | many → one |
| `stock_quants` | `products`, `locations` | many → one each; UNIQUE pair |
| `stock_move_lines` | `stock_moves`, `products` | many → one each |
| `stock_ledger` | `stock_moves`, `products`, `locations` | many → one each |
| `stock_moves` | `users` (responsible) | many → one |

---

## Key Constraints

1. **`stock_moves.reference`** — UNIQUE, always server-generated as `<SHORT_CODE>/<TYPE>/<SEQUENCE>`. Never client-supplied.

2. **Validate transaction is atomic (all-or-nothing):**
   ```
   BEGIN
     INSERT INTO stock_ledger ...
     UPSERT stock_quants ...
     UPDATE stock_moves SET status='done', done_date=now()
   COMMIT
   ```
   A crash mid-validate must never leave stock and ledger out of sync.

3. **Stock-blocking rule** — before validating a delivery or internal move, the transaction checks:
   ```sql
   on_hand_qty - reserved_qty >= requested done_qty
   ```
   for **every line**. If any line fails → full rollback, no partial commit.

---

## Reference Sequence Format

| Operation | Prefix | Example |
|-----------|--------|---------|
| Receipt | `WH/IN/` | `WH/IN/0001` |
| Delivery | `WH/OUT/` | `WH/OUT/0042` |
| Internal | `WH/INT/` | `WH/INT/0007` |
| Adjustment | `WH/ADJ/` | `WH/ADJ/0003` |

---

## Migration Files

All SQL lives in `db/migrations/` and runs in order:

| File | Contents |
|------|----------|
| `0001_users.sql` | `users`, `otp_tokens`, `refresh_tokens` — owned by auth |
| `0002_catalog.sql` | `categories`, `products` |
| `0003_locations.sql` | `warehouses`, `locations` |
| `0004_stock_quants.sql` | `stock_quants` |
| `0005_operations.sql` | `stock_moves`, `stock_move_lines` |
| `0006_ledger.sql` | `stock_ledger` |
| `0007_seed.sql` | Virtual locations + default UoMs + default warehouse |

Run all: `psql $DATABASE_URL -f db/migrations/run_all.sql`