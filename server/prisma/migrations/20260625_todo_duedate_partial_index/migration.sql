-- Replace full dueDate index with a partial index (todos that have a due date only)
DROP INDEX IF EXISTS "Todo_userId_dueDate_seq_idx";

CREATE INDEX "Todo_userId_dueDate_seq_partial_idx"
  ON "Todo" ("userId", "dueDate", "seq")
  WHERE "dueDate" IS NOT NULL;
