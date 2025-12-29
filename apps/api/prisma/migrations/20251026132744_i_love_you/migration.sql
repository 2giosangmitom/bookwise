/*
  Warnings:

  - Added the required column `short_biography` to the `Author` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Author" ADD COLUMN     "short_biography" VARCHAR(255) NOT NULL;
