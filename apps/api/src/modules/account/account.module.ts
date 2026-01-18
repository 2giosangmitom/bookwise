import { Account } from "@/database/entities/account";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "../user/user.module";
import { AccountService } from "./account.service";
import { AccountController } from "./account.controller";
import { HashingUtils } from "@/utils/hashing";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SessionModule } from "../session/session.module";

@Module({
  imports: [
    SessionModule,
    TypeOrmModule.forFeature([Account]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow("JWT_SECRET"),
      }),
    }),
    UserModule,
  ],
  providers: [AccountService, HashingUtils],
  controllers: [AccountController],
})
export class AccountModule {}
