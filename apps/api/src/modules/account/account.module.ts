import { Account } from "@/database/entities/accounts.js";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "../user/user.module.js";
import { AccountService } from "./account.service.js";
import { AccountController } from "./account.controller.js";

@Module({
  imports: [TypeOrmModule.forFeature([Account]), UserModule],
  providers: [AccountService],
  controllers: [AccountController],
})
export class AccountModule {}
