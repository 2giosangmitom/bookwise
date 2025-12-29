/*
  Warnings:

  - A unique constraint covering the columns `[isbn]` on the table `Book` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `isbn` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `published_at` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Author" ADD COLUMN     "image_url" VARCHAR(255);

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "image_url" VARCHAR(255),
ADD COLUMN     "isbn" VARCHAR(20) NOT NULL,
ADD COLUMN     "published_at" DATE NOT NULL;

-- AlterTable
ALTER TABLE "Publisher" ADD COLUMN     "image_url" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");
