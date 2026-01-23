import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Loan } from "@/database/entities/loan";
import { CreateLoanBody } from "./loan.dto";
import { UserService } from "../user/user.service";

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    private readonly userService: UserService,
  ) {}

  async create(data: CreateLoanBody) {
    const user = await this.userService.findById(data.user);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const loan = this.loanRepository.create({
      user,
      loanDate: new Date(data.loanDate),
      dueDate: new Date(data.dueDate),
      bookCopies: data.bookCopies.map((id) => ({ id })),
    });

    return this.loanRepository.save(loan);
  }
}
