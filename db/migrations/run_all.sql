-- run_all.sql
-- Runs all migrations in order.
-- Usage: psql $DATABASE_URL -f db/migrations/run_all.sql
--
-- NOTE: 0001_users.sql is owned by the auth team and must be run FIRST
-- before this script. This script assumes users table already exists.

\echo '==> 0001 users'
\i db/migrations/0001_users.sql

\echo '==> 0002 catalog'
\i db/migrations/0002_catalog.sql

\echo '==> 0003 locations'
\i db/migrations/0003_locations.sql

\echo '==> 0004 stock_quants'
\i db/migrations/0004_stock_quants.sql

\echo '==> 0005 operations'
\i db/migrations/0005_operations.sql

\echo '==> 0005b add user fk'
\i db/migrations/0005b_add_user_fk.sql

\echo '==> 0006 ledger'
\i db/migrations/0006_ledger.sql

\echo '==> 0007 seed'
\i db/migrations/0007_seed.sql

\echo '==> 0008 password_resets'
\i db/migrations/0008_password_resets.sql

\echo '==> All migrations complete.'
