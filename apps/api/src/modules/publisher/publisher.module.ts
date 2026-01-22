import { Publisher } from "@/database/entities/publisher";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PublisherService } from "./publisher.service";
import { PublisherController } from "./publisher.controller";
import { UserModule } from "../user/user.module";

@Module({
  imports: [TypeOrmModule.forFeature([Publisher]), UserModule],
  exports: [PublisherService],
  providers: [PublisherService],
  controllers: [PublisherController],
})
export class PublisherModule {}
