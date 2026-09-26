-- Migration: 0006_ledger.sql
-- Creates: stock_ledger
-- Run after: 0005_operations.sql

-- ─────────────────────────────────────────────────────────
-- Stock Ledger  (append-only audit log)
--
-- One row per (move_line × affected_location).
-- Written exactly ONCE inside the validate transaction:
--
--   BEGIN
--     INSERT INTO stock_ledger ...         ← this file's table
--     INSERT / ON CONFLICT UPDATE
--       stock_quants ...                   ← 0004_stock_quants.sql
--     UPDATE stock_moves SET status='done' ← 0005_operations.sql
--   COMMIT
--
-- NEVER UPDATE or DELETE rows in this table.
-- If stock_quants and stock_ledger disagree, re-derive quants
-- from the ledger — it is the source of truth.
--
-- quantity_delta is signed:
--   +50  when stock enters a real location (receipt dest, transfer dest, adj gain)
--   -20  when stock leaves a real location (delivery src, transfer src, adj loss)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_ledger (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_move_id   UUID        NOT NULL REFERENCES stock_moves(id)      ON DELETE RESTRICT,
    stock_move_line_id UUID     REFERENCES stock_move_lines(id)          ON DELETE RESTRICT,
    product_id      UUID        NOT NULL REFERENCES products(id)         ON DELETE RESTRICT,
    location_id     UUID        NOT NULL REFERENCES locations(id)        ON DELETE RESTRICT,
    quantity_delta  NUMERIC     NOT NULL,    -- signed: positive = in, negative = out
    balance_after   NUMERIC     NOT NULL,    -- running on_hand_qty at this location after the move
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No UPDATE or DELETE ever — enforced by convention + application layer.
-- Optionally enforce at DB level with a trigger:
CREATE OR REPLACE FUNCTION stock_ledger_immutable()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION 'stock_ledger rows are immutable — INSERT only';
END;
$$;

CREATE TRIGGER trg_stock_ledger_no_update
    BEFORE UPDATE ON stock_ledger
    FOR EACH ROW EXECUTE FUNCTION stock_ledger_immutable();

CREATE TRIGGER trg_stock_ledger_no_delete
    BEFORE DELETE ON stock_ledger
    FOR EACH ROW EXECUTE FUNCTION stock_ledger_immutable();

-- Indexes for Move History screen queries
CREATE INDEX IF NOT EXISTS idx_ledger_product    ON stock_ledger(product_id);
CREATE INDEX IF NOT EXISTS idx_ledger_location   ON stock_ledger(location_id);
CREATE INDEX IF NOT EXISTS idx_ledger_move       ON stock_ledger(stock_move_id);
CREATE INDEX IF NOT EXISTS idx_ledger_created    ON stock_ledger(created_at DESC);
