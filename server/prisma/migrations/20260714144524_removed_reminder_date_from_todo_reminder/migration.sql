/*
  Warnings:

  - You are about to drop the column `reminderDate` on the `TodoReminder` table. All the data in the column will be lost.
  - You are about to drop the column `dailyDigest` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TodoReminder" DROP COLUMN "reminderDate";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "dailyDigest";
