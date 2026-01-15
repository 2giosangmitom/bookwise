import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Loan } from "@/database/entities/loan";

@Module({
  imports: [TypeOrmModule.forFeature([Loan])],
})
export class LoanModule {}
