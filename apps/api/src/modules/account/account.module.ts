import { Account } from "@/database/entities/account";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "../user/user.module";
import { AccountService } from "./account.service";
import { AccountController } from "./account.controller";
import { HashingUtils } from "@/utils/hashing";

@Module({
  imports: [TypeOrmModule.forFeature([Account]), UserModule],
  providers: [AccountService, HashingUtils],
  controllers: [AccountController],
})
export class AccountModule {}
