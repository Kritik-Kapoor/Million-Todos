/*
  Warnings:

  - Made the column `seq` on table `Todo` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Todo" ALTER COLUMN "seq" SET NOT NULL;
