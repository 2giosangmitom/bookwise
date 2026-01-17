import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BookCopy } from "@/database/entities/bookCopy";
import { BookCopyController } from "./bookCopy.controller";
import { BookCopyService } from "./bookCopy.service";
import { BookModule } from "../book/book.module";

@Module({
  imports: [TypeOrmModule.forFeature([BookCopy]), BookModule],
  controllers: [BookCopyController],
  providers: [BookCopyService],
  exports: [BookCopyService],
})
export class BookCopyModule {}
