-- Migration: 0003_locations.sql
-- Creates: warehouses, locations (including virtual locations seed)
-- Run after: 0002_catalog.sql

-- ─────────────────────────────────────────────────────────
-- Warehouses
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS warehouses (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT        NOT NULL,
    short_code TEXT        NOT NULL,           -- e.g. "WH" — used in reference numbers
    address    TEXT,
    is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT warehouses_name_unique       UNIQUE (name),
    CONSTRAINT warehouses_short_code_unique UNIQUE (short_code)
);

-- ─────────────────────────────────────────────────────────
-- Locations
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS locations (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID        REFERENCES warehouses(id) ON DELETE RESTRICT,
    name         TEXT        NOT NULL,
    short_code   TEXT,                         -- e.g. "Stock" → displayed as "WH/Stock"
    usage        TEXT        NOT NULL DEFAULT 'internal'
                             CHECK (usage IN ('internal', 'vendor', 'customer', 'loss')),
    is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Virtual locations have no warehouse (warehouse_id = NULL)
-- Real locations must belong to a warehouse
ALTER TABLE locations
    ADD CONSTRAINT locations_warehouse_required
    CHECK (
        usage IN ('vendor', 'customer', 'loss')   -- virtual → no warehouse needed
        OR warehouse_id IS NOT NULL               -- real → must have warehouse
    );

CREATE INDEX IF NOT EXISTS idx_locations_warehouse ON locations(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_locations_usage     ON locations(usage);
