import { Controller } from "@nestjs/common";
import { TypedBody, TypedRoute } from "@nestia/core";
import { BookCopyService } from "./bookCopy.service";
import { CreateBookCopyResponse, type CreateBookCopyBody } from "./bookCopy.dto";
import { ApiTags } from "@nestjs/swagger";

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
}
