import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Category } from "@/database/entities/category";

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
})
export class CategoryModule {}
