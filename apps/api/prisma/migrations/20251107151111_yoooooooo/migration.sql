-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "publisher_id" UUID;

-- CreateTable
CREATE TABLE "Publisher" (
    "publisher_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "website" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Publisher_pkey" PRIMARY KEY ("publisher_id")
);

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_publisher_id_fkey" FOREIGN KEY ("publisher_id") REFERENCES "Publisher"("publisher_id") ON DELETE SET NULL ON UPDATE CASCADE;
