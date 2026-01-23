import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Loan } from "@/database/entities/loan";
import { LoanService } from "./loan.service";
import { LoanController } from "./loan.controller";
import { UserModule } from "../user/user.module";

@Module({
  imports: [TypeOrmModule.forFeature([Loan]), UserModule],
  controllers: [LoanController],
  providers: [LoanService],
})
export class LoanModule {}
