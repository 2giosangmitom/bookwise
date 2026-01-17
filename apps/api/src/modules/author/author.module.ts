import { Author } from "@/database/entities/author";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthorService } from "./author.service";
import { AuthorController } from "./author.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Author])],
  exports: [AuthorService],
  providers: [AuthorService],
  controllers: [AuthorController],
})
export class AuthorModule {}
