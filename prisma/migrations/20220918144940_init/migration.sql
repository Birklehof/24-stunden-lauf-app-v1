/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `AccessToken` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AccessToken" DROP COLUMN "updatedAt",
ADD COLUMN     "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
