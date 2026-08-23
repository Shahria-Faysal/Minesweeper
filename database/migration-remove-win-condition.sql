-- Migration: remove the win/lose concept, add cells_revealed.
--
-- Run this ONLY if you already created minesweeper_db from an
-- earlier version of schema.sql and want to keep your existing data.
-- If you're setting up fresh, just import schema.sql instead — it
-- already has the new column and no `result` column.

USE minesweeper_db;

ALTER TABLE game_results
    ADD COLUMN cells_revealed INT UNSIGNED NOT NULL DEFAULT 0 AFTER time_taken;

-- Existing rows have no cells_revealed data (it wasn't tracked
-- before), so they default to 0. Their score won't be recalculated
-- retroactively — this migration only affects new games going
-- forward.

ALTER TABLE game_results
    DROP COLUMN result;
