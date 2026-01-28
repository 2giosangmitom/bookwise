import { Controller, HttpCode, Req, Query } from "@nestjs/common";
import { Auth, Roles } from "@/guards/auth";
import { LoanService } from "./loan.service";
import { User } from "@/database/entities/user";
import { TypedRoute, TypedParam } from "@nestia/core";
import { tags } from "typia";
import { CreateLoanResponse, type CreateLoanBody, type GetLoansResponse } from "./loan.dto";
import { ApiTags } from "@nestjs/swagger";
import { Role } from "@bookwise/shared";
import { type FastifyRequest } from "fastify";

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

  @TypedRoute.Get("/")
  async getLoans(
    @Req() request: FastifyRequest,
    @Query("cursor") cursor?: string,
    @Query("limit") limit?: number,
    @Query("state") state?: string,
  ): Promise<GetLoansResponse> {
    const user = request.getDecorator("user") as User;

    const { items, nextCursor } = await this.loanService.findByUserWithCursor(user.id, cursor, limit, state);

    return {
      message: "Loans fetched successfully",
      meta: { nextCursor: nextCursor },
      data: {
        loans: items.map((l) => ({
          id: l.id,
          loanDate: l.loanDate,
          dueDate: l.dueDate,
          returnDate: l.returnDate ? l.returnDate : undefined,
          bookCopies: l.bookCopies.map((b) => ({
            id: b.id,
            barcode: b.barcode,
            book: { id: b.book.id, title: b.book.title, isbn: b.book.isbn },
          })),
        })),
      },
    };
  }

  @TypedRoute.Delete("/:id")
  @HttpCode(204)
  @Roles([Role.ADMIN])
  async deleteLoan(@TypedParam("id") id: string & tags.Format<"uuid">): Promise<void> {
    await this.loanService.delete(id);
  }
}
