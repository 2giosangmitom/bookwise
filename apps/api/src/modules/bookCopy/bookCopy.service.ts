import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike, Not, FindOptionsSelect, In } from "typeorm";
import { BookCopy } from "@/database/entities/bookCopy";
import { CreateBookCopyBody, UpdateBookCopyBody } from "./bookCopy.dto";
import { BookStatus, BookCondition } from "@bookwise/shared";
import { BookService } from "../book/book.service";

@Injectable()
export class BookCopyService {
  constructor(
    @InjectRepository(BookCopy)
    private readonly bookCopyRepository: Repository<BookCopy>,
    private readonly bookService: BookService,
  ) {}

  async create(data: CreateBookCopyBody) {
    // validate book existence
    const book = await this.bookService.checkExistence(data.bookId);
    if (!book) throw new NotFoundException("Book not found");

    // check barcode conflict
    const existed = await this.bookCopyRepository.existsBy({ barcode: data.barcode });
    if (existed) throw new ConflictException("Barcode already exists");

    // insert and return inserted id
    return this.bookCopyRepository
      .createQueryBuilder()
      .insert()
      .into(BookCopy)
      .values({
        book: { id: data.bookId },
        barcode: data.barcode,
        status: data.status || BookStatus.AVAILABLE,
        condition: data.condition || BookCondition.NEW,
      })
      .returning("id")
      .execute();
  }

  async update(id: string, data: UpdateBookCopyBody): Promise<number> {
    // ensure book copy exists
    const existed = await this.bookCopyRepository.existsBy({ id });
    if (!existed) throw new NotFoundException("Book copy not found");

    // check barcode uniqueness when provided
    if (data.barcode) {
      const conflict = await this.bookCopyRepository.existsBy({ barcode: data.barcode, id: Not(id) });
      if (conflict) throw new ConflictException("Barcode already exists");
    }

    const updateResult = await this.bookCopyRepository.update(id, data);
    return updateResult.affected!;
  }

  async delete(id: string): Promise<void> {
    const existed = await this.bookCopyRepository.existsBy({ id });
    if (!existed) throw new NotFoundException("Book copy not found");
    await this.bookCopyRepository.delete(id);
  }

  async findById(id: string): Promise<BookCopy | null> {
    return this.bookCopyRepository.findOne({
      where: { id },
    });
  }

  search(
    options: { page?: number; limit?: number; search?: string; status?: BookStatus; condition?: BookCondition },
    select?: FindOptionsSelect<BookCopy>,
  ) {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;

    const search = options.search ? ILike(`%${options.search}%`) : undefined;
    const condition = options.condition;
    const status = options.status;

    return this.bookCopyRepository.findAndCount({
      select,
      where: [
        { book: { title: search }, condition, status },
        { barcode: search, condition, status },
      ],
      take: limit,
      skip: (page - 1) * limit,
    });
  }

  checkAvailability(...id: string[]) {
    return this.bookCopyRepository.existsBy({
      id: In(id),
      status: BookStatus.AVAILABLE,
      condition: In([BookCondition.NEW, BookCondition.GOOD]),
    });
  }
}
