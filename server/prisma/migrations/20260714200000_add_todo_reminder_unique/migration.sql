-- DropIndex
DROP INDEX IF EXISTS "TodoReminder_todoId_type_channel_idx";

-- CreateIndex
CREATE UNIQUE INDEX "TodoReminder_todoId_type_channel_key" ON "TodoReminder"("todoId", "type", "channel");
