/*
  Warnings:

  - You are about to drop the column `search_vector` on the `Todo` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('DUE_6_HOURS', 'DAY_SUMMARY');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "ReminderChannel" AS ENUM ('EMAIL', 'SMS');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "UserTokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TokenType" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "UserTokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TodoReminder" (
    "id" TEXT NOT NULL,
    "todoId" TEXT NOT NULL,
    "type" "ReminderType" NOT NULL,
    "channel" "ReminderChannel" NOT NULL,
    "reminderDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "status" "ReminderStatus" NOT NULL,
    "providerMessageId" TEXT,

    CONSTRAINT "TodoReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserTokens_userId_type_idx" ON "UserTokens"("userId", "type");

-- CreateIndex
CREATE INDEX "TodoReminder_todoId_type_channel_idx" ON "TodoReminder"("todoId", "type", "channel");

-- CreateIndex
CREATE INDEX "Todo_userId_hasLabels_seq_idx" ON "Todo"("userId", "hasLabels", "seq");

-- AddForeignKey
ALTER TABLE "UserTokens" ADD CONSTRAINT "UserTokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TodoReminder" ADD CONSTRAINT "TodoReminder_todoId_fkey" FOREIGN KEY ("todoId") REFERENCES "Todo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
