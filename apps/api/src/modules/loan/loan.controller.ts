import { Controller } from "@nestjs/common";
import { Auth, Roles } from "@/guards/auth";
import { LoanService } from "./loan.service";
import { TypedRoute } from "@nestia/core";
import { CreateLoanResponse, type CreateLoanBody } from "./loan.dto";
import { ApiTags } from "@nestjs/swagger";
import { Role } from "@bookwise/shared";

@Controller("loan")
@ApiTags("Loan")
@Auth()
export class LoanController {
  constructor(private loanService: LoanService) {}

  @TypedRoute.Post()
  @Roles([Role.ADMIN, Role.LIBRARIAN])
  async createLoan(data: CreateLoanBody): Promise<CreateLoanResponse> {
    const loan = await this.loanService.create(data);

    return {
      message: "Loan created successfully",
      data: { id: loan.id },
    };
  }
}
