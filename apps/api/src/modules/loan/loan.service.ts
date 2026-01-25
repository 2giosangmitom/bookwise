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

  // Cursor pagination for user's loans. cursor is loan.loanDate ISO string.
  async findByUserWithCursor(
    userId: string,
    cursor?: string,
    limit?: number,
    state?: string,
  ): Promise<{ items: Loan[]; nextCursor: string | null }> {
    const take = limit && limit > 0 ? limit : 10;

    const qb = this.loanRepository
      .createQueryBuilder("loan")
      .leftJoinAndSelect("loan.bookCopies", "bookCopy")
      .leftJoinAndSelect("bookCopy.book", "book")
      .where("loan.userId = :userId", { userId })
      .orderBy("loan.loanDate", "DESC")
      .take(take + 1);

    if (cursor) {
      qb.andWhere("loan.loanDate < :cursor", { cursor: new Date(cursor) });
    }

    // filter by state: borrowed (not returned), returned, overdue
    if (state) {
      if (state === "BORROWED") {
        qb.andWhere("loan.returnDate IS NULL");
      } else if (state === "RETURNED") {
        qb.andWhere("loan.returnDate IS NOT NULL");
      } else if (state === "OVERDUE") {
        qb.andWhere("loan.returnDate IS NULL AND loan.dueDate < :now", { now: new Date() });
      }
    }

    const results = await qb.getMany();

    const hasMore = results.length > take;
    const items = hasMore ? results.slice(0, take) : results;
    const nextCursor = hasMore ? items[items.length - 1].loanDate.toISOString() : null;

    return { items, nextCursor };
  }
}
