import { Account } from "@/database/entities/accounts";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "../user/user.module";
import { AccountService } from "./account.service";
import { AccountController } from "./account.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Account]), UserModule],
  providers: [AccountService],
  controllers: [AccountController],
})
export class AccountModule {}
