import { Controller, HttpCode, NotFoundException } from "@nestjs/common";
import { AuthorService } from "./author.service";
import { TypedBody, TypedParam, TypedQuery, TypedRoute } from "@nestia/core";
import {
  CreateAuthorResponse,
  GetAuthorResponse,
  type CreateAuthorBody,
  type UpdateAuthorBody,
  type GetAuthorsResponse,
} from "./author.dto";
import { tags } from "typia";
import { ApiTags } from "@nestjs/swagger";
import { Auth } from "@/guards/auth";
import { Role } from "@bookwise/shared";

@Controller("/author")
@ApiTags("Author")
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  // Internal routes
  @TypedRoute.Post()
  @Auth(Role.ADMIN, Role.LIBRARIAN)
  async createAuthor(@TypedBody() body: CreateAuthorBody): Promise<CreateAuthorResponse> {
    const createdAuthor = await this.authorService.create(body);

    return {
      message: "Author has been created successfully",
      data: {
        authorId: createdAuthor.raw[0].id,
      },
    };
  }

  @TypedRoute.Patch("/:id")
  @HttpCode(204)
  @Auth(Role.ADMIN, Role.LIBRARIAN)
  async updateAuthor(
    @TypedParam("id") id: string & tags.Format<"uuid">,
    @TypedBody() body: UpdateAuthorBody,
  ): Promise<void> {
    await this.authorService.update(id, body);
  }

  @TypedRoute.Delete("/:id")
  @HttpCode(204)
  @Auth(Role.ADMIN, Role.LIBRARIAN)
  async deleteAuthor(@TypedParam("id") id: string & tags.Format<"uuid">): Promise<void> {
    await this.authorService.delete(id);
  }

  @TypedRoute.Get("/")
  @Auth(Role.ADMIN, Role.LIBRARIAN)
  async getAllAuthors(
    @TypedQuery()
    query: Partial<{ page: number & tags.Type<"uint32">; limit: number & tags.Type<"uint32">; search: string }>,
  ): Promise<GetAuthorsResponse> {
    const [authors, total] = await this.authorService.search(query);

    return {
      message: "Authors fetched successfully",
      meta: {
        total,
      },
      data: authors,
    };
  }

  // Public routes
  @TypedRoute.Get("/:id")
  async findAuthorById(@TypedParam("id") id: string & tags.Format<"uuid">): Promise<GetAuthorResponse> {
    // Check author existence
    const author = await this.authorService.findById(id);
    if (!author) {
      throw new NotFoundException("Author not found");
    }

    return author;
  }
}
