/*
  Warnings:

  - You are about to drop the column `available_copies` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `total_copies` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `book_id` on the `Loan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[book_clone_id]` on the table `Loan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Publisher` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `book_clone_id` to the `Loan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Publisher` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BookCondition" AS ENUM ('NEW', 'GOOD', 'WORN', 'DAMAGED', 'LOST');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMIN';

-- DropForeignKey
ALTER TABLE "Loan" DROP CONSTRAINT "Loan_book_id_fkey";

-- AlterTable
ALTER TABLE "Author" ALTER COLUMN "nationality" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "available_copies",
DROP COLUMN "total_copies";

-- AlterTable
ALTER TABLE "Loan" DROP COLUMN "book_id",
ADD COLUMN     "book_clone_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Publisher" ADD COLUMN     "slug" VARCHAR(50) NOT NULL;

-- CreateTable
CREATE TABLE "Location" (
    "location_id" VARCHAR(50) NOT NULL,
    "room" VARCHAR(50) NOT NULL,
    "floor" SMALLINT NOT NULL,
    "shelf" SMALLINT NOT NULL,
    "row" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("location_id")
);

-- CreateTable
CREATE TABLE "Book_Clone" (
    "book_clone_id" UUID NOT NULL,
    "book_id" UUID NOT NULL,
    "location_id" VARCHAR(50) NOT NULL,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "barcode" VARCHAR(50) NOT NULL,
    "condition" "BookCondition" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_Clone_pkey" PRIMARY KEY ("book_clone_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_Clone_barcode_key" ON "Book_Clone"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Loan_book_clone_id_key" ON "Loan"("book_clone_id");

-- CreateIndex
CREATE UNIQUE INDEX "Publisher_slug_key" ON "Publisher"("slug");

-- AddForeignKey
ALTER TABLE "Book_Clone" ADD CONSTRAINT "Book_Clone_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("book_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book_Clone" ADD CONSTRAINT "Book_Clone_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("location_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_book_clone_id_fkey" FOREIGN KEY ("book_clone_id") REFERENCES "Book_Clone"("book_clone_id") ON DELETE RESTRICT ON UPDATE CASCADE;
