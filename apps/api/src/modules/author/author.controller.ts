import { Controller } from "@nestjs/common";
import { AuthorService } from "./author.service";
import { TypedBody, TypedParam, TypedRoute } from "@nestia/core";
import { CreateAuthorResponse, DeleteAuthorResponse, type CreateAuthorBody } from "./author.dto";
import { tags } from "typia";
import { ApiTags } from "@nestjs/swagger";

@Controller("/author")
@ApiTags("Author")
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
  async deleteAuthor(@TypedParam("id") id: string & tags.Format<"uuid">): Promise<DeleteAuthorResponse> {
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
