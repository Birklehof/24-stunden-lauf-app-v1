/*
  Warnings:

  - You are about to drop the `Item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sale` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_saleUuid_fkey";

-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_sellerUuid_fkey";

-- DropTable
DROP TABLE "Item";

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "Sale";

-- DropTable
DROP TABLE "Student";

-- CreateTable
CREATE TABLE "Group" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Runner" (
    "number" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "groupUuid" TEXT,
    "grade" TEXT,

    CONSTRAINT "Runner_pkey" PRIMARY KEY ("number")
);

-- CreateTable
CREATE TABLE "Lap" (
    "uuid" TEXT NOT NULL,
    "runnerNumber" INTEGER NOT NULL,
    "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lap_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Group_name_key" ON "Group"("name");

-- AddForeignKey
ALTER TABLE "Runner" ADD CONSTRAINT "Runner_groupUuid_fkey" FOREIGN KEY ("groupUuid") REFERENCES "Group"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lap" ADD CONSTRAINT "Lap_runnerNumber_fkey" FOREIGN KEY ("runnerNumber") REFERENCES "Runner"("number") ON DELETE RESTRICT ON UPDATE CASCADE;
