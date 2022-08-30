-- CreateTable
CREATE TABLE "User" (
    "uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT E'guest',

    CONSTRAINT "User_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Student" (
    "number" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "secondName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "nameAlias" TEXT NOT NULL,
    "grade" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("number")
);

-- CreateTable
CREATE TABLE "Product" (
    "uuid" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Item" (
    "uuid" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "saleUuid" TEXT NOT NULL,
    "pricePerUnit" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Sale" (
    "uuid" TEXT NOT NULL,
    "sellerUuid" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "soldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_firstName_secondName_lastName_nameAlias_grade_key" ON "Student"("firstName", "secondName", "lastName", "nameAlias", "grade");

-- CreateIndex
CREATE UNIQUE INDEX "Product_barcode_key" ON "Product"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_saleUuid_fkey" FOREIGN KEY ("saleUuid") REFERENCES "Sale"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_sellerUuid_fkey" FOREIGN KEY ("sellerUuid") REFERENCES "User"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
