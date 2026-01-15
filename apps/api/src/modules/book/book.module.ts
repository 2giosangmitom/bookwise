import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Book } from "@/database/entities/book";

@Module({
  imports: [TypeOrmModule.forFeature([Book])],
})
export class BookModule {}
