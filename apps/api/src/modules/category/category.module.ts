import { Category } from "@/database/entities/category";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoryService } from "./category.service";
import { CategoryController } from "./category.controller";
import { UserModule } from "../user/user.module";

@Module({
  imports: [TypeOrmModule.forFeature([Category]), UserModule],
  exports: [CategoryService],
  providers: [CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {}
