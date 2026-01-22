import { Account } from "@/database/entities/account";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "../user/user.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { HashingUtils } from "@/utils/hashing";
import { SessionModule } from "../session/session.module";

@Module({
  imports: [SessionModule, TypeOrmModule.forFeature([Account]), UserModule],
  providers: [AuthService, HashingUtils],
  controllers: [AuthController],
})
export class AuthModule {}
