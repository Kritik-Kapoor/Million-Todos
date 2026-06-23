-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dailyDigest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dueDateReminder" BOOLEAN NOT NULL DEFAULT true;
