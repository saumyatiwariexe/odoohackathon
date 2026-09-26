-- Migration: 0002_catalog.sql
-- Creates: categories, products
-- Run after: 0001_users.sql (auth team)

-- ─────────────────────────────────────────────────────────
-- Categories
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT categories_name_unique UNIQUE (name)
);

-- ─────────────────────────────────────────────────────────
-- Products
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id            UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    sku           TEXT           NOT NULL,
    name          TEXT           NOT NULL,
    category_id   UUID           REFERENCES categories(id) ON DELETE SET NULL,
    uom           TEXT           NOT NULL DEFAULT 'pcs',   -- pcs | kg | ltr | m | box
    cost_per_unit NUMERIC(12,2),
    reorder_min   NUMERIC        NOT NULL DEFAULT 0,       -- low-stock alert threshold
    reorder_max   NUMERIC        NOT NULL DEFAULT 0,       -- target restock level
    is_active     BOOLEAN        NOT NULL DEFAULT TRUE,    -- soft-delete flag
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT now(),

    CONSTRAINT products_sku_unique UNIQUE (sku),
    CONSTRAINT products_reorder_min_positive CHECK (reorder_min >= 0),
    CONSTRAINT products_reorder_max_gte_min  CHECK (reorder_max >= reorder_min)
);

CREATE INDEX IF NOT EXISTS idx_products_category  ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku       ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_active    ON products(is_active);
