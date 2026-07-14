/*
  Warnings:

  - You are about to drop the column `providerMessageId` on the `TodoReminder` table. All the data in the column will be lost.
  - You are about to drop the column `sentAt` on the `TodoReminder` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `TodoReminder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TodoReminder" DROP COLUMN "providerMessageId",
DROP COLUMN "sentAt",
DROP COLUMN "status";

-- DropEnum
DROP TYPE "ReminderStatus";
