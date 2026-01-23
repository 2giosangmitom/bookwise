import { Session } from "@/database/entities/session";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SessionService } from "./session.service";
import { SessionController } from "./session.controller";
import { UserModule } from "../user/user.module";

@Module({
  imports: [TypeOrmModule.forFeature([Session]), UserModule],
  providers: [SessionService],
  controllers: [SessionController],
  exports: [SessionService],
})
export class SessionModule {}
