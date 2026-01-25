import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, Repository } from "typeorm";
import { Loan } from "@/database/entities/loan";
import { CreateLoanBody } from "./loan.dto";
import { UserService } from "../user/user.service";
import { BookCopyService } from "../bookCopy/bookCopy.service";
import { BookCondition, BookStatus } from "@bookwise/shared";
import { BookCopy } from "@/database/entities/bookCopy";

@Injectable()
export class LoanService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    private readonly userService: UserService,
    private readonly bookCopyService: BookCopyService,
    private readonly dataSource: DataSource,
  ) {}

  async create(data: CreateLoanBody) {
    const user = await this.userService.findById(data.user);
    const bookCopies = await this.bookCopyService.findByIds(data.bookCopies);

    for (const bookCopy of bookCopies) {
      if (
        bookCopy.status !== BookStatus.AVAILABLE ||
        (bookCopy.condition !== BookCondition.GOOD && bookCopy.condition !== BookCondition.NEW)
      ) {
        throw new NotFoundException(`Book copy with ID ${bookCopy.id} is not available for loan`);
      }
    }

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const loan = this.loanRepository.create({
      user,
      loanDate: new Date(data.loanDate),
      dueDate: new Date(data.dueDate),
      bookCopies,
    });

    return this.dataSource.transaction(async (manager) => {
      const createdLoan = await manager.save(loan);
      await manager.update(
        BookCopy,
        {
          id: In(data.bookCopies),
        },
        {
          status: BookStatus.BORROWED,
        },
      );

      return createdLoan;
    });
  }

  async delete(id: string): Promise<void> {
    const loan = await this.loanRepository.findOne({
      where: { id },
      relations: ["bookCopies"],
    });

    if (!loan) {
      throw new NotFoundException("Loan not found");
    }

    const bookCopyIds = (loan.bookCopies || []).map((b) => b.id);

    await this.dataSource.transaction(async (manager) => {
      if (bookCopyIds.length > 0) {
        await manager.update(
          BookCopy,
          {
            id: In(bookCopyIds),
          },
          {
            status: BookStatus.AVAILABLE,
          },
        );
      }

      await manager.delete(Loan, id);
    });
  }
}
