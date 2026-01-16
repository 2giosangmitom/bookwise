import { Controller, HttpCode } from "@nestjs/common";
import { AuthorService } from "./author.service";
import { TypedBody, TypedParam, TypedRoute } from "@nestia/core";
import { CreateAuthorResponse, type CreateAuthorBody } from "./author.dto";
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
  @HttpCode(204)
  async deleteAuthor(@TypedParam("id") id: string & tags.Format<"uuid">): Promise<void> {
    await this.authorService.delete(id);
  }
}
