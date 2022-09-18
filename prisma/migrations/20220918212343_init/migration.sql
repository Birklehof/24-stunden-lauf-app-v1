/*
  Warnings:

  - A unique constraint covering the columns `[studentNumber]` on the table `Runner` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Runner" ADD COLUMN     "studentNumber" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Runner_studentNumber_key" ON "Runner"("studentNumber");
