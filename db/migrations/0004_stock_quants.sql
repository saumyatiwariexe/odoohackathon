-- Migration: 0004_stock_quants.sql
-- Creates: stock_quants
-- Run after: 0003_locations.sql

-- ─────────────────────────────────────────────────────────
-- Stock Quants
-- Real-time cache of on-hand quantity per (product × location).
-- Updated atomically inside every validate transaction.
-- Source of truth for the UI's "on hand" and "free to use" columns.
-- free_to_use = on_hand_qty - reserved_qty  (computed at read time)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_quants (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id   UUID        NOT NULL REFERENCES products(id)  ON DELETE RESTRICT,
    location_id  UUID        NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    on_hand_qty  NUMERIC     NOT NULL DEFAULT 0,
    reserved_qty NUMERIC     NOT NULL DEFAULT 0,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT stock_quants_unique_product_location UNIQUE (product_id, location_id),
    CONSTRAINT stock_quants_on_hand_positive        CHECK (on_hand_qty  >= 0),
    CONSTRAINT stock_quants_reserved_positive       CHECK (reserved_qty >= 0),
    CONSTRAINT stock_quants_reserved_lte_onhand     CHECK (reserved_qty <= on_hand_qty)
);

CREATE INDEX IF NOT EXISTS idx_squants_product  ON stock_quants(product_id);
CREATE INDEX IF NOT EXISTS idx_squants_location ON stock_quants(location_id);
