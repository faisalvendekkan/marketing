-- =============================================================================
-- Abilix AI Marketing Studio - One-shot installer
-- Usage (Hostinger phpMyAdmin or CLI):
--   mysql -h HOST -u USER -p DB_NAME < installation.sql
-- This runs the full schema then the seed data.
-- =============================================================================

SOURCE schema.sql;
SOURCE seed.sql;

-- Note: The SOURCE command works in the mysql CLI. In phpMyAdmin, import
-- schema.sql first, then seed.sql, using the Import tab.
