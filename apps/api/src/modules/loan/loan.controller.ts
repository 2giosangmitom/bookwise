import { Controller, HttpCode } from "@nestjs/common";
import { Auth, Roles } from "@/guards/auth";
import { LoanService } from "./loan.service";
import { TypedRoute, TypedParam } from "@nestia/core";
import { tags } from "typia";
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

  @TypedRoute.Delete("/:id")
  @HttpCode(204)
  @Roles([Role.ADMIN])
  async deleteLoan(@TypedParam("id") id: string & tags.Format<"uuid">): Promise<void> {
    await this.loanService.delete(id);
  }
}
