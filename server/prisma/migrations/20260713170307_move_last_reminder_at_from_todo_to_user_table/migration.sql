/*
  Warnings:

  - You are about to drop the column `lastReminderAt` on the `Todo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Todo" DROP COLUMN "lastReminderAt";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastReminderAt" TIMESTAMP(3);
