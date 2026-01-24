import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Loan } from "@/database/entities/loan";
import { LoanService } from "./loan.service";
import { LoanController } from "./loan.controller";
import { UserModule } from "../user/user.module";
import { BookCopyModule } from "../bookCopy/bookCopy.module";

@Module({
  imports: [TypeOrmModule.forFeature([Loan]), UserModule, BookCopyModule],
  controllers: [LoanController],
  providers: [LoanService],
})
export class LoanModule {}
