import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BookCopy } from "@/database/entities/bookCopy";
import { CreateBookCopyBody } from "./bookCopy.dto";
import { BookStatus, BookCondition } from "@bookwise/shared";
import { BookService } from "../book/book.service";

@Injectable()
export class BookCopyService {
  constructor(
    @InjectRepository(BookCopy)
    private readonly bookCopyRepository: Repository<BookCopy>,
    private readonly bookService: BookService,
  ) {}

  async create(data: CreateBookCopyBody): Promise<BookCopy> {
    const book = await this.bookService.findById(data.bookId);

    if (!book) {
      throw new NotFoundException("Book not found");
    }

    const existingBookCopy = await this.bookCopyRepository.existsBy({
      barcode: data.barcode,
    });

    if (existingBookCopy) {
      throw new ConflictException("Barcode already exists");
    }

    const bookCopy = this.bookCopyRepository.create({
      book,
      barcode: data.barcode,
      status: data.status || BookStatus.AVAILABLE,
      condition: data.condition || BookCondition.NEW,
    });

    return this.bookCopyRepository.save(bookCopy);
  }
}
