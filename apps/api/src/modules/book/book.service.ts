import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Book } from "@/database/entities/book";

import { CreateBookBody, UpdateBookBody } from "./book.dto";
import { AuthorService } from "../author/author.service";
import { CategoryService } from "../category/category.service";
import { PublisherService } from "../publisher/publisher.service";

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly authorService: AuthorService,
    private readonly categoryService: CategoryService,
    private readonly publisherService: PublisherService,
  ) {}

  async create(data: CreateBookBody): Promise<Book> {
    const existingBook = await this.bookRepository.existsBy({
      isbn: data.isbn,
    });

    if (existingBook) {
      throw new ConflictException("ISBN already in use");
    }

    const [authorsExist, categoriesExist, publishersExist] = await Promise.all([
      this.authorService.existsById(...data.authorIds),
      this.categoryService.existsById(...data.categoryIds),
      this.publisherService.existsById(...data.publisherIds),
    ]);

    if (!authorsExist) {
      throw new NotFoundException("One or more authors not found");
    }

    if (!categoriesExist) {
      throw new NotFoundException("One or more categories not found");
    }

    if (!publishersExist) {
      throw new NotFoundException("One or more publishers not found");
    }

    const book = this.bookRepository.create({
      title: data.title,
      description: data.description,
      isbn: data.isbn,
      publishedDate: new Date(data.publishedDate),
      authors: data.authorIds.map((id) => ({ id })),
      categories: data.categoryIds.map((id) => ({ id })),
      publishers: data.publisherIds.map((id) => ({ id })),
    });

    return this.bookRepository.save(book);
  }

  async update(id: string, data: UpdateBookBody): Promise<number> {
    const book = await this.bookRepository.findOneBy({ id });

    if (!book) {
      throw new NotFoundException("Book not found");
    }

    if (data.isbn && data.isbn !== book.isbn) {
      const existingBook = await this.bookRepository.existsBy({
        isbn: data.isbn,
      });

      if (existingBook) {
        throw new ConflictException("ISBN already in use");
      }
    }

    if (data.authorIds) {
      const authorsExist = await this.authorService.existsById(...data.authorIds);
      if (!authorsExist) {
        throw new NotFoundException("One or more authors not found");
      }
    }

    if (data.categoryIds) {
      const categoriesExist = await this.categoryService.existsById(...data.categoryIds);
      if (!categoriesExist) {
        throw new NotFoundException("One or more categories not found");
      }
    }

    if (data.publisherIds) {
      const publishersExist = await this.publisherService.existsById(...data.publisherIds);
      if (!publishersExist) {
        throw new NotFoundException("One or more publishers not found");
      }
    }

    const updateData: Partial<Book> = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.isbn !== undefined) {
      updateData.isbn = data.isbn;
    }
    if (data.publishedDate !== undefined) {
      updateData.publishedDate = new Date(data.publishedDate);
    }
    if (data.authorIds !== undefined) {
      const authors = await this.authorService.findByIds(...data.authorIds);
      updateData.authors = authors;
    }
    if (data.categoryIds !== undefined) {
      const categories = await this.categoryService.findByIds(...data.categoryIds);
      updateData.categories = categories;
    }
    if (data.publisherIds !== undefined) {
      const publishers = await this.publisherService.findByIds(...data.publisherIds);
      updateData.publishers = publishers;
    }

    const updateResult = await this.bookRepository.update(id, updateData);

    return updateResult.affected!;
  }

  async delete(id: string): Promise<void> {
    const book = await this.bookRepository.findOneBy({ id });

    if (!book) {
      throw new NotFoundException("Book not found");
    }

    await this.bookRepository.delete(id);
  }
}
