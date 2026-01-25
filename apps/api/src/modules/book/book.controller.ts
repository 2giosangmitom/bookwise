import { Controller, HttpCode, NotFoundException, Query } from "@nestjs/common";
import { BookService } from "./book.service";
import { TypedBody, TypedRoute, TypedParam } from "@nestia/core";
import type {
  CreateBookBody,
  UpdateBookBody,
  CreateBookResponse,
  GetBookResponse,
  SearchBooksQuery,
  SearchBooksResponse,
} from "./book.dto";
import { ApiTags } from "@nestjs/swagger";
import { tags } from "typia";
import { Auth } from "@/guards/auth";
import { Role } from "@bookwise/shared";

@Controller("/book")
@ApiTags("Book")
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @TypedRoute.Post()
  @Auth(Role.ADMIN, Role.LIBRARIAN)
  async createBook(@TypedBody() body: CreateBookBody): Promise<CreateBookResponse> {
    const createdBook = await this.bookService.create(body);

    return {
      message: "Book has been created successfully",
      data: { bookId: createdBook.id },
    };
  }

  @TypedRoute.Get("/:id")
  async getBook(@TypedParam("id") id: string & tags.Format<"uuid">): Promise<GetBookResponse> {
    const book = await this.bookService.findById(id);

    if (!book) {
      throw new NotFoundException("Book not found");
    }

    return {
      id: book.id,
      title: book.title,
      description: book.description,
      photoFileName: book.photoFileName,
      isbn: book.isbn,
      publishedDate: book.publishedDate.toISOString().split("T")[0] as string & tags.Format<"date">,
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
    };
  }

  @TypedRoute.Get("/")
  async searchBooks(@Query() query: SearchBooksQuery): Promise<SearchBooksResponse> {
    return this.bookService.searchBooks(query);
  }

  @TypedRoute.Patch("/:id")
  @HttpCode(204)
  @Auth(Role.ADMIN, Role.LIBRARIAN)
  async updateBook(
    @TypedParam("id") id: string & tags.Format<"uuid">,
    @TypedBody() body: UpdateBookBody,
  ): Promise<void> {
    await this.bookService.update(id, body);
  }

  @TypedRoute.Delete("/:id")
  @HttpCode(204)
  @Auth(Role.ADMIN, Role.LIBRARIAN)
  async deleteBook(@TypedParam("id") id: string & tags.Format<"uuid">): Promise<void> {
    await this.bookService.delete(id);
  }
}
