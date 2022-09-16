/*
  Warnings:

  - You are about to drop the column `groupUuid` on the `Runner` table. All the data in the column will be lost.
  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `grade` on table `Runner` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Runner" DROP CONSTRAINT "Runner_groupUuid_fkey";

-- AlterTable
ALTER TABLE "Runner" DROP COLUMN "groupUuid",
ADD COLUMN     "house" TEXT NOT NULL DEFAULT 'Extern',
ALTER COLUMN "grade" SET NOT NULL,
ALTER COLUMN "grade" SET DEFAULT 'Keine Klasse';

-- DropTable
DROP TABLE "Group";
