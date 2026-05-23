/*
  Warnings:

  - A unique constraint covering the columns `[cancel_token]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "cancel_token" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "bookings_cancel_token_key" ON "bookings"("cancel_token");
