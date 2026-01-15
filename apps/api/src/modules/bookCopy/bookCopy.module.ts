import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BookCopy } from "@/database/entities/bookCopy";

@Module({
  imports: [TypeOrmModule.forFeature([BookCopy])],
})
export class BookCopyModule {}
