-- Migration: 0005_operations.sql  (standalone version — no users FK)
-- Wire up responsible_user_id FK after auth team runs 0001_users.sql
-- Run after: 0003_locations.sql, 0004_stock_quants.sql

CREATE TABLE IF NOT EXISTS stock_moves (
    id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    reference            TEXT        NOT NULL,
    move_type            TEXT        NOT NULL
                         CHECK (move_type IN ('receipt','delivery','internal','adjustment')),
    status               TEXT        NOT NULL DEFAULT 'draft'
                         CHECK (status IN ('draft','waiting','ready','done','cancelled')),
    source_location_id   UUID        NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    dest_location_id     UUID        NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    contact              TEXT,
    notes                TEXT,
    -- responsible_user_id added via 0005b_add_user_fk.sql after auth team runs 0001
    responsible_user_id  UUID,
    scheduled_date       TIMESTAMPTZ,
    done_date            TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT stock_moves_reference_unique UNIQUE (reference),
    CONSTRAINT stock_moves_internal_diff_locations
        CHECK (move_type != 'internal' OR source_location_id != dest_location_id),
    CONSTRAINT stock_moves_done_date_on_done
        CHECK (done_date IS NULL OR status = 'done')
);

CREATE INDEX IF NOT EXISTS idx_smoves_type        ON stock_moves(move_type);
CREATE INDEX IF NOT EXISTS idx_smoves_status      ON stock_moves(status);
CREATE INDEX IF NOT EXISTS idx_smoves_scheduled   ON stock_moves(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_smoves_responsible ON stock_moves(responsible_user_id);

CREATE TABLE IF NOT EXISTS stock_move_lines (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_move_id UUID        NOT NULL REFERENCES stock_moves(id) ON DELETE CASCADE,
    product_id    UUID        NOT NULL REFERENCES products(id)    ON DELETE RESTRICT,
    expected_qty  NUMERIC     NOT NULL,
    done_qty      NUMERIC     NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT sml_expected_positive CHECK (expected_qty > 0),
    CONSTRAINT sml_done_nonnegative  CHECK (done_qty >= 0)
);

CREATE INDEX IF NOT EXISTS idx_sml_move    ON stock_move_lines(stock_move_id);
CREATE INDEX IF NOT EXISTS idx_sml_product ON stock_move_lines(product_id);

CREATE SEQUENCE IF NOT EXISTS seq_move_receipt    START 1;
CREATE SEQUENCE IF NOT EXISTS seq_move_delivery   START 1;
CREATE SEQUENCE IF NOT EXISTS seq_move_internal   START 1;
CREATE SEQUENCE IF NOT EXISTS seq_move_adjustment START 1;
