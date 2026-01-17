import { Controller, HttpCode } from "@nestjs/common";
import { TypedBody, TypedRoute, TypedParam } from "@nestia/core";
import { BookCopyService } from "./bookCopy.service";
import { CreateBookCopyResponse, type CreateBookCopyBody, type UpdateBookCopyBody } from "./bookCopy.dto";
import { ApiTags } from "@nestjs/swagger";
import { tags } from "typia";

@Controller("/book-copy")
@ApiTags("Book Copy")
export class BookCopyController {
  constructor(private readonly bookCopyService: BookCopyService) {}

  @TypedRoute.Post()
  async createBookCopy(@TypedBody() body: CreateBookCopyBody): Promise<CreateBookCopyResponse> {
    const createdBookCopy = await this.bookCopyService.create(body);

    return {
      message: "Book copy has been created successfully",
      data: { bookCopyId: createdBookCopy.id },
    };
  }

  @TypedRoute.Patch("/:id")
  @HttpCode(204)
  async updateBookCopy(
    @TypedParam("id") id: string & tags.Format<"uuid">,
    @TypedBody() body: UpdateBookCopyBody,
  ): Promise<void> {
    await this.bookCopyService.update(id, body);
  }

  @TypedRoute.Delete("/:id")
  @HttpCode(204)
  async deleteBookCopy(@TypedParam("id") id: string & tags.Format<"uuid">): Promise<void> {
    await this.bookCopyService.delete(id);
  }
}
