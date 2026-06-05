/*
  Warnings:

  - A unique constraint covering the columns `[seq]` on the table `Todo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "seq" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Todo_seq_key" ON "Todo"("seq");
