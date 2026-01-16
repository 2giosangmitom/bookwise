import { Controller, Param, ParseUUIDPipe } from "@nestjs/common";
import { AuthorService } from "./author.service";
import { TypedBody, TypedRoute } from "@nestia/core";
import { CreateAuthorResponse, DeleteAuthorResponse, type CreateAuthorBody } from "./author.dto";

@Controller("/author")
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @TypedRoute.Post()
  async createAuthor(@TypedBody() body: CreateAuthorBody): Promise<CreateAuthorResponse> {
    const createdAuthor = await this.authorService.create(body);

    return {
      message: "Author has been created successfully",
      data: { authorId: createdAuthor.id },
    };
  }

  @TypedRoute.Delete("/:id")
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
