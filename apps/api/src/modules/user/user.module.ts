import { Module } from "@nestjs/common";
import { UserService } from "./user.service.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "@/database/entities/user.js";

@Module({
  providers: [UserService],
  imports: [TypeOrmModule.forFeature([User])],
  exports: [UserService],
})
export class UserModule {}
