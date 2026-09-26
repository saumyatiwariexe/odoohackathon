-- Migration: 0005b_add_user_fk.sql
-- Adds the FK from stock_moves.responsible_user_id → users.id
-- Run AFTER auth team's 0001_users.sql has been applied.

ALTER TABLE stock_moves
    ADD CONSTRAINT stock_moves_responsible_user_fk
    FOREIGN KEY (responsible_user_id)
    REFERENCES users(id)
    ON DELETE SET NULL;
