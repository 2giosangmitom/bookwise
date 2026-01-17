import { Controller, HttpCode } from "@nestjs/common";
import { BookService } from "./book.service";
import { TypedBody, TypedRoute, TypedParam } from "@nestia/core";
import { CreateBookResponse, type CreateBookBody } from "./book.dto";
import { ApiTags } from "@nestjs/swagger";
import { tags } from "typia";

@Controller("/book")
@ApiTags("Book")
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @TypedRoute.Post()
  async createBook(@TypedBody() body: CreateBookBody): Promise<CreateBookResponse> {
    const createdBook = await this.bookService.create(body);

    return {
      message: "Book has been created successfully",
      data: { bookId: createdBook.id },
    };
  }

  @TypedRoute.Delete("/:id")
  @HttpCode(204)
  async deleteBook(@TypedParam("id") id: string & tags.Format<"uuid">): Promise<void> {
    await this.bookService.delete(id);
  }
}
