-- CreateIndex
CREATE INDEX "Todo_userId_dueDate_seq_idx" ON "Todo"("userId", "dueDate", "seq");
