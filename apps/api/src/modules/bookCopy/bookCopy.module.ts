import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BookCopy } from "@/database/entities/bookCopy";
import { BookCopyController } from "./bookCopy.controller";
import { BookCopyService } from "./bookCopy.service";
import { BookModule } from "../book/book.module";
import { UserModule } from "../user/user.module";

@Module({
  imports: [TypeOrmModule.forFeature([BookCopy]), BookModule, UserModule],
  controllers: [BookCopyController],
  providers: [BookCopyService],
  exports: [BookCopyService],
})
export class BookCopyModule {}
