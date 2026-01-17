import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Book } from "@/database/entities/book";
import { CreateBookBody } from "./book.dto";
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
      photoFileName: data.photoFileName ?? null,
      authors: data.authorIds.map((id) => ({ id })),
      categories: data.categoryIds.map((id) => ({ id })),
      publishers: data.publisherIds.map((id) => ({ id })),
    });

    return this.bookRepository.save(book);
  }
}
