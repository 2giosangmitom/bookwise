import { Body, Controller, Delete, Param, Post, UsePipes, ParseUUIDPipe } from "@nestjs/common";
import { AuthorService } from "./author.service";
import {
  type createAuthorDTO,
  createAuthorSchema,
  type CreateAuthorResponse,
  type DeleteAuthorResponse,
} from "@bookwise/shared";
import { ZodValidationPipe } from "@/pipes/zod";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from "@nestjs/swagger";
import {
  ApiErrorResponseJsonSchema,
  CreateAuthorBodyJsonSchema,
  CreateAuthorResponseJsonSchema,
  DeleteAuthorResponseJsonSchema,
} from "@/constants";

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

  @Delete("/:id")
  @ApiOkResponse({
    schema: DeleteAuthorResponseJsonSchema,
    description: "Author has been deleted successfully",
  })
  @ApiNotFoundResponse({ schema: ApiErrorResponseJsonSchema, description: "Author not found" })
  async deleteAuthor(@Param("id", ParseUUIDPipe) id: string): Promise<DeleteAuthorResponse> {
    const deletedAuthor = await this.authorService.delete(id);

    return {
      message: "Author has been deleted successfully",
      data: {
        name: deletedAuthor.name,
        biography: deletedAuthor.biography,
        dateOfBirth: deletedAuthor.dateOfBirth.toISOString(),
        dateOfDeath: deletedAuthor.dateOfDeath?.toISOString() ?? null,
        photoFileName: deletedAuthor.photoFileName,
        slug: deletedAuthor.slug,
      },
    };
  }
}
