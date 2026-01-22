import { Author } from "@/database/entities/author";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthorService } from "./author.service";
import { AuthorController } from "./author.controller";
import { UserModule } from "../user/user.module";

@Module({
  imports: [TypeOrmModule.forFeature([Author]), UserModule],
  exports: [AuthorService],
  providers: [AuthorService],
  controllers: [AuthorController],
})
export class AuthorModule {}
