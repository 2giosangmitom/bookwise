import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository, Not, ILike, FindOptionsSelect } from "typeorm";
import { Book } from "@/database/entities/book";
import { CreateBookBody, UpdateBookBody, SearchBooksQuery } from "./book.dto";
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

  findById(id: string): Promise<Book | null> {
    return this.bookRepository.findOne({
      select: {
        id: true,
        title: true,
        description: true,
        photoFileName: true,
        isbn: true,
        publishedDate: true,
        authors: {
          id: true,
          name: true,
          slug: true,
        },
        categories: {
          id: true,
          name: true,
          slug: true,
        },
        publishers: {
          id: true,
          name: true,
          slug: true,
        },
      },
      where: {
        id,
      },
    });
  }

  async searchBooks(query: SearchBooksQuery, select?: FindOptionsSelect<Book>) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search ? ILike(`%${query.search}%`) : undefined;

    return this.bookRepository.findAndCount({
      select,
      take: limit,
      skip: (page - 1) * limit,
      where: [
        { title: search },
        { description: search },
        { isbn: search },
        { authors: { name: search } },
        { categories: { name: search } },
        { publishers: { name: search } },
      ],
    });
  }

  async checkExistence(...ids: string[]) {
    return this.bookRepository.existsBy({ id: In(ids) });
  }
}
