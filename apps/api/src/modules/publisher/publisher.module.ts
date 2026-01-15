import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Publisher } from "@/database/entities/publisher";

@Module({
  imports: [TypeOrmModule.forFeature([Publisher])],
})
export class PublisherModule {}
