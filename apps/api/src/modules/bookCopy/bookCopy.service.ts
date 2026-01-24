import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
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

  async update(id: string, data: UpdateBookCopyBody): Promise<number> {
    const bookCopy = await this.bookCopyRepository.findOneBy({ id });

    if (!bookCopy) {
      throw new NotFoundException("Book copy not found");
    }

    if (data.bookId && data.bookId !== bookCopy.book.id) {
      const book = await this.bookService.findById(data.bookId);
      if (!book) {
        throw new NotFoundException("Book not found");
      }
    }

    if (data.barcode && data.barcode !== bookCopy.barcode) {
      const existingBookCopy = await this.bookCopyRepository.existsBy({
        barcode: data.barcode,
      });

      if (existingBookCopy) {
        throw new ConflictException("Barcode already exists");
      }
    }

    const updateData: Partial<BookCopy> = {};

    if (data.bookId !== undefined) {
      const book = await this.bookService.findById(data.bookId);
      if (!book) {
        throw new NotFoundException("Book not found");
      }
      updateData.book = book;
    }
    if (data.barcode !== undefined) {
      updateData.barcode = data.barcode;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }
    if (data.condition !== undefined) {
      updateData.condition = data.condition;
    }

    const updateResult = await this.bookCopyRepository.update(id, updateData);

    return updateResult.affected!;
  }

  async delete(id: string): Promise<void> {
    const bookCopy = await this.bookCopyRepository.findOneBy({ id });

    if (!bookCopy) {
      throw new NotFoundException("Book copy not found");
    }

    await this.bookCopyRepository.delete(id);
  }

  async findById(id: string): Promise<BookCopy | null> {
    return this.bookCopyRepository.findOne({
      where: { id },
      relations: ["book"],
    });
  }

  findByIds(ids: string[]) {
    return this.bookCopyRepository.findBy({
      id: In(ids),
    });
  }
}
