-- Sync the todo_seq_seq sequence to the actual MAX(seq) in the table.
-- This is a no-op if the sequence is already ahead of all existing rows.
-- Safe to run multiple times.
SELECT setval(
  pg_get_serial_sequence('"Todo"', 'seq'),
  GREATEST((SELECT COALESCE(MAX(seq), 0) FROM "Todo"), 1)
);
