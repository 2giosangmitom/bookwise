import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository, Not, FindOptionsSelect } from "typeorm";
import { Book } from "@/database/entities/book";
import { CreateBookBody, UpdateBookBody, SearchBooksQuery, SearchBooksResponse } from "./book.dto";
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

  async create(data: CreateBookBody) {
    // Check ISBN conflict
    const existed = await this.bookRepository.existsBy({ isbn: data.isbn });
    if (existed) throw new ConflictException("ISBN already in use");

    // Validate related entities in parallel
    const [authorsExist, categoriesExist, publishersExist] = await Promise.all([
      this.authorService.checkExistence(...data.authorIds),
      this.categoryService.checkExistence(...data.categoryIds),
      this.publisherService.checkExistence(...data.publisherIds),
    ]);

    if (!authorsExist) throw new NotFoundException("One or more authors not found");
    if (!categoriesExist) throw new NotFoundException("One or more categories not found");
    if (!publishersExist) throw new NotFoundException("One or more publishers not found");

    // Insert with query builder to avoid extra roundtrip
    return this.bookRepository
      .createQueryBuilder()
      .insert()
      .into(Book)
      .values({
        title: data.title,
        description: data.description,
        isbn: data.isbn,
        publishedDate: data.publishedDate,
        authors: data.authorIds.map((id) => ({ id })),
        categories: data.categoryIds.map((id) => ({ id })),
        publishers: data.publisherIds.map((id) => ({ id })),
      })
      .returning("id")
      .execute();
  }

  async update(id: string, data: UpdateBookBody) {
    // Check book existence
    const existed = await this.bookRepository.existsBy({ id });
    if (!existed) throw new NotFoundException("Book not found");

    // Check ISBN conflict
    if (data.isbn) {
      const isbnTaken = await this.bookRepository.existsBy({ isbn: data.isbn, id: Not(id) });
      if (isbnTaken) throw new ConflictException("ISBN already in use");
    }

    // Validate related entities if provided
    if (data.authorIds) {
      const authorsExist = await this.authorService.checkExistence(...data.authorIds);
      if (!authorsExist) throw new NotFoundException("One or more authors not found");
    }

    if (data.categoryIds) {
      const categoriesExist = await this.categoryService.checkExistence(...data.categoryIds);
      if (!categoriesExist) throw new NotFoundException("One or more categories not found");
    }

    if (data.publisherIds) {
      const publishersExist = await this.publisherService.checkExistence(...data.publisherIds);
      if (!publishersExist) throw new NotFoundException("One or more publishers not found");
    }

    await this.bookRepository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const existed = await this.bookRepository.existsBy({ id });
    if (!existed) throw new NotFoundException("Book not found");

    await this.bookRepository.delete(id);
  }

  async findById(id: string): Promise<Book | null> {
    return this.bookRepository.findOne({
      where: { id },
      relations: ["authors", "categories", "publishers"],
    });
  }

  findByIds(ids: string[], select?: (keyof Book)[]) {
    return this.bookRepository.find({
      select: select ? (Object.fromEntries(select.map((key) => [key, true])) as FindOptionsSelect<Book>) : undefined,
      where: { id: In(ids) },
    });
  }

  async searchBooks(query: SearchBooksQuery): Promise<SearchBooksResponse> {
    const qb = this.bookRepository
      .createQueryBuilder("book")
      .leftJoinAndSelect("book.authors", "author")
      .leftJoinAndSelect("book.categories", "category")
      .leftJoinAndSelect("book.publishers", "publisher");

    // Search by title
    if (query.title) {
      qb.andWhere("book.title ILIKE :title", { title: `%${query.title}%` });
    }

    // Search by authors (array of names)
    if (query.authors && query.authors.length > 0) {
      qb.andWhere("author.name ILIKE ANY(ARRAY[:authors])", {
        authors: query.authors.map((author) => `%${author}%`),
      });
    }

    // Search by categories (array of names)
    if (query.categories && query.categories.length > 0) {
      qb.andWhere("category.name ILIKE ANY(ARRAY[:categories])", {
        categories: query.categories.map((category) => `%${category}%`),
      });
    }

    // Search by publishers (array of names)
    if (query.publishers && query.publishers.length > 0) {
      qb.andWhere("publisher.name ILIKE ANY(ARRAY[:publishers])", {
        publishers: query.publishers.map((publisher) => `%${publisher}%`),
      });
    }

    // Get total count before pagination
    const total = await qb.getCount();

    // Apply pagination
    const limit = query.limit || 20;
    const offset = query.offset || 0;
    qb.limit(limit).offset(offset);

    // Order by title for consistent results
    qb.orderBy("book.title", "ASC");

    const books = await qb.getMany();

    return {
      books: books.map((book) => ({
        id: book.id,
        title: book.title,
        description: book.description,
        photoFileName: book.photoFileName,
        isbn: book.isbn,
        publishedDate: book.publishedDate,
        authors: book.authors.map((author) => ({
          id: author.id,
          name: author.name,
          slug: author.slug,
        })),
        categories: book.categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
        })),
        publishers: book.publishers.map((publisher) => ({
          id: publisher.id,
          name: publisher.name,
          slug: publisher.slug,
        })),
      })),
      total,
      limit,
      offset,
    };
  }

  async checkExistence(...ids: string[]) {
    return this.bookRepository.existsBy({ id: In(ids) });
  }
}
