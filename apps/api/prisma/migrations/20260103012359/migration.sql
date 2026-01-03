-- DropForeignKey
ALTER TABLE "Book_Category" DROP CONSTRAINT "Book_Category_book_id_fkey";

-- DropForeignKey
ALTER TABLE "Book_Category" DROP CONSTRAINT "Book_Category_category_id_fkey";

-- AddForeignKey
ALTER TABLE "Book_Category" ADD CONSTRAINT "Book_Category_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "Book"("book_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book_Category" ADD CONSTRAINT "Book_Category_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("category_id") ON DELETE CASCADE ON UPDATE CASCADE;
