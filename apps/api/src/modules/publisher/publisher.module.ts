import { Publisher } from "@/database/entities/publisher";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PublisherService } from "./publisher.service";
import { PublisherController } from "./publisher.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Publisher])],
  exports: [PublisherService],
  providers: [PublisherService],
  controllers: [PublisherController],
})
export class PublisherModule {}
