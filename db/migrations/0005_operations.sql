-- Migration: 0005_operations.sql
-- Creates: stock_moves, stock_move_lines
-- Run after: 0003_locations.sql, 0001_users.sql

-- ─────────────────────────────────────────────────────────
-- Stock Moves  (one row = one operation document)
-- All four operation types share this table:
--   receipt    → source = VENDOR location,   dest = real location
--   delivery   → source = real location,     dest = CUSTOMER location
--   internal   → source = real location,     dest = different real location
--   adjustment → source = LOSS/GAIN virtual, dest = real location (or vice-versa)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_moves (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Reference is server-generated, never client-supplied.
    -- Format: <warehouse_short_code>/<TYPE>/<zero-padded-seq>
    -- e.g.  WH/IN/0001  WH/OUT/0042  WH/INT/0007  WH/ADJ/0003
    reference            TEXT        NOT NULL,

    move_type            TEXT        NOT NULL
                         CHECK (move_type IN ('receipt','delivery','internal','adjustment')),

    status               TEXT        NOT NULL DEFAULT 'draft'
                         CHECK (status IN ('draft','waiting','ready','done','cancelled')),

    source_location_id   UUID        NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    dest_location_id     UUID        NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,

    contact              TEXT,                  -- vendor name (receipt) or customer name (delivery)
    notes                TEXT,

    responsible_user_id  UUID        REFERENCES users(id) ON DELETE SET NULL,

    scheduled_date       TIMESTAMPTZ,
    done_date            TIMESTAMPTZ,           -- set inside validate transaction
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT stock_moves_reference_unique UNIQUE (reference),

    -- Internal transfers must have different source and destination
    CONSTRAINT stock_moves_internal_diff_locations
        CHECK (move_type != 'internal' OR source_location_id != dest_location_id),

    -- done_date only set when status is done
    CONSTRAINT stock_moves_done_date_on_done
        CHECK (done_date IS NULL OR status = 'done')
);

CREATE INDEX IF NOT EXISTS idx_smoves_type       ON stock_moves(move_type);
CREATE INDEX IF NOT EXISTS idx_smoves_status     ON stock_moves(status);
CREATE INDEX IF NOT EXISTS idx_smoves_scheduled  ON stock_moves(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_smoves_responsible ON stock_moves(responsible_user_id);

-- ─────────────────────────────────────────────────────────
-- Stock Move Lines  (one row per product within a move)
-- A single receipt can contain 10 products → 10 lines, 1 move.
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_move_lines (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_move_id UUID        NOT NULL REFERENCES stock_moves(id) ON DELETE CASCADE,
    product_id    UUID        NOT NULL REFERENCES products(id)    ON DELETE RESTRICT,
    expected_qty  NUMERIC     NOT NULL,          -- planned quantity
    done_qty      NUMERIC     NOT NULL DEFAULT 0, -- filled on validate; may differ (partial)
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT sml_expected_positive CHECK (expected_qty > 0),
    CONSTRAINT sml_done_nonnegative  CHECK (done_qty >= 0)
);

CREATE INDEX IF NOT EXISTS idx_sml_move    ON stock_move_lines(stock_move_id);
CREATE INDEX IF NOT EXISTS idx_sml_product ON stock_move_lines(product_id);

-- ─────────────────────────────────────────────────────────
-- Sequence for reference number generation (per move type)
-- Used by the backend to produce WH/IN/0001, WH/IN/0002 etc.
-- ─────────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS seq_move_receipt    START 1;
CREATE SEQUENCE IF NOT EXISTS seq_move_delivery   START 1;
CREATE SEQUENCE IF NOT EXISTS seq_move_internal   START 1;
CREATE SEQUENCE IF NOT EXISTS seq_move_adjustment START 1;
