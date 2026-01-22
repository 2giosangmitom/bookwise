import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Book } from "@/database/entities/book";
import { BookService } from "./book.service";
import { BookController } from "./book.controller";
import { AuthorModule } from "../author/author.module";
import { CategoryModule } from "../category/category.module";
import { PublisherModule } from "../publisher/publisher.module";
import { UserModule } from "../user/user.module";

@Module({
  imports: [TypeOrmModule.forFeature([Book]), AuthorModule, CategoryModule, PublisherModule, UserModule],
  providers: [BookService],
  controllers: [BookController],
  exports: [BookService],
})
export class BookModule {}
