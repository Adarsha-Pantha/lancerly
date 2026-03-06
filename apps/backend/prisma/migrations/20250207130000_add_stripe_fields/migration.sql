-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "stripeAccountId" TEXT;

-- CreateUniqueIndex
CREATE UNIQUE INDEX "Profile_stripeAccountId_key" ON "Profile"("stripeAccountId");

