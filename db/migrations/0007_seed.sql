-- Migration: 0007_seed.sql
-- Seeds: virtual locations, default warehouse, default categories
-- Run after: all 0001–0006 migrations

-- ─────────────────────────────────────────────────────────
-- Virtual Locations (created once, never edited by users)
-- ─────────────────────────────────────────────────────────
INSERT INTO locations (id, warehouse_id, name, short_code, usage) VALUES
    ('00000000-0000-0000-0000-000000000001', NULL, 'Vendors',         'VENDOR',   'vendor'),
    ('00000000-0000-0000-0000-000000000002', NULL, 'Customers',       'CUSTOMER', 'customer'),
    ('00000000-0000-0000-0000-000000000003', NULL, 'Inventory Loss',  'LOSS',     'loss')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────
-- Default Warehouse
-- ─────────────────────────────────────────────────────────
INSERT INTO warehouses (id, name, short_code, address) VALUES
    ('10000000-0000-0000-0000-000000000001', 'Main Warehouse', 'WH', NULL)
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────
-- Default Locations for Main Warehouse
-- ─────────────────────────────────────────────────────────
INSERT INTO locations (warehouse_id, name, short_code, usage) VALUES
    ('10000000-0000-0000-0000-000000000001', 'Input Zone',   'Input',   'internal'),
    ('10000000-0000-0000-0000-000000000001', 'Quality Zone', 'Quality', 'internal'),
    ('10000000-0000-0000-0000-000000000001', 'Stock',        'Stock',   'internal'),
    ('10000000-0000-0000-0000-000000000001', 'Output Zone',  'Output',  'internal')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────────────────
-- Default Product Categories
-- ─────────────────────────────────────────────────────────
INSERT INTO categories (name) VALUES
    ('Raw Materials'),
    ('Finished Goods'),
    ('Consumables'),
    ('Spare Parts'),
    ('Packaging')
ON CONFLICT (name) DO NOTHING;
