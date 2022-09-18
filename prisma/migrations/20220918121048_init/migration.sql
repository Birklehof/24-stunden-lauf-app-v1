-- CreateTable
CREATE TABLE "AccessToken" (
    "uuid" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdByUuid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessToken_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccessToken_token_key" ON "AccessToken"("token");

-- AddForeignKey
ALTER TABLE "AccessToken" ADD CONSTRAINT "AccessToken_createdByUuid_fkey" FOREIGN KEY ("createdByUuid") REFERENCES "User"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
