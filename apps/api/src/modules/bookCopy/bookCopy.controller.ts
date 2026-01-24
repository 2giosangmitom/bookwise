import { Controller, HttpCode, NotFoundException, Query } from "@nestjs/common";
import { TypedBody, TypedRoute, TypedParam } from "@nestia/core";
import { BookCopyService } from "./bookCopy.service";
import {
  CreateBookCopyResponse,
  GetBookCopyResponse,
  type CreateBookCopyBody,
  type UpdateBookCopyBody,
  type GetBookCopiesResponse,
} from "./bookCopy.dto";
import { ApiTags } from "@nestjs/swagger";
import { tags } from "typia";
import { Auth } from "@/guards/auth";
import { Role } from "@bookwise/shared";
import { BookStatus, BookCondition } from "@bookwise/shared";

@Controller("/book-copy")
@ApiTags("Book Copy")
export class BookCopyController {
  constructor(private readonly bookCopyService: BookCopyService) {}

  @TypedRoute.Post()
  @Auth(Role.ADMIN, Role.LIBRARIAN)
  async createBookCopy(@TypedBody() body: CreateBookCopyBody): Promise<CreateBookCopyResponse> {
    const createdBookCopy = await this.bookCopyService.create(body);

    return {
      message: "Book copy has been created successfully",
      data: { bookCopyId: createdBookCopy.id },
    };
  }

  @TypedRoute.Get("/:id")
  async getBookCopy(@TypedParam("id") id: string & tags.Format<"uuid">): Promise<GetBookCopyResponse> {
    const bookCopy = await this.bookCopyService.findById(id);

    if (!bookCopy) {
      throw new NotFoundException("Book copy not found");
    }

    return {
      id: bookCopy.id,
      barcode: bookCopy.barcode,
      status: bookCopy.status,
      condition: bookCopy.condition,
      book: {
        id: bookCopy.book.id,
        title: bookCopy.book.title,
        isbn: bookCopy.book.isbn,
      },
    };
  }

  @TypedRoute.Patch("/:id")
  @HttpCode(204)
  @Auth(Role.ADMIN, Role.LIBRARIAN)
  async updateBookCopy(
    @TypedParam("id") id: string & tags.Format<"uuid">,
    @TypedBody() body: UpdateBookCopyBody,
  ): Promise<void> {
    await this.bookCopyService.update(id, body);
  }

  @TypedRoute.Delete("/:id")
  @HttpCode(204)
  @Auth(Role.ADMIN, Role.LIBRARIAN)
  async deleteBookCopy(@TypedParam("id") id: string & tags.Format<"uuid">): Promise<void> {
    await this.bookCopyService.delete(id);
  }

  @TypedRoute.Get("/")
  async searchBookCopies(
    @Query("search") search?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("status") status?: BookStatus,
    @Query("condition") condition?: BookCondition,
  ): Promise<GetBookCopiesResponse> {
    const [copies, total] = await this.bookCopyService.search({
      page,
      limit,
      search,
      status: status,
      condition: condition,
    });

    return {
      message: "Book copies fetched successfully",
      meta: { total },
      data: copies.map((c) => ({
        id: c.id,
        barcode: c.barcode,
        status: c.status,
        condition: c.condition,
        book: {
          id: c.book.id,
          title: c.book.title,
          isbn: c.book.isbn,
        },
      })),
    };
  }
}
