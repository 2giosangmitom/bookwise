import { Body, Controller, Post, UsePipes } from "@nestjs/common";
import { AuthorService } from "./author.service";
import { type createAuthorDTO, createAuthorSchema, type CreateAuthorResponse } from "@bookwise/shared";
import { ZodValidationPipe } from "@/pipes/zod";
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiCreatedResponse } from "@nestjs/swagger";
import { ApiErrorResponseJsonSchema, CreateAuthorBodyJsonSchema, CreateAuthorResponseJsonSchema } from "@/constants";

@Controller("/author")
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createAuthorSchema))
  @ApiBody({ schema: CreateAuthorBodyJsonSchema })
  @ApiCreatedResponse({
    schema: CreateAuthorResponseJsonSchema,
    description: "Author has been created successfully",
  })
  @ApiConflictResponse({ schema: ApiErrorResponseJsonSchema, description: "Slug already in use" })
  @ApiBadRequestResponse({ schema: ApiErrorResponseJsonSchema, description: "Validation failed" })
  async createAuthor(@Body() body: createAuthorDTO): Promise<CreateAuthorResponse> {
    const createdAuthor = await this.authorService.create(body);

    return {
      message: "Author has been created successfully",
      data: { authorId: createdAuthor.id },
    };
  }
}
