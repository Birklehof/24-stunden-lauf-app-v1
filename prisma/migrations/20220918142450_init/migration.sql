/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `AccessToken` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AccessToken" DROP COLUMN "expiresAt";
