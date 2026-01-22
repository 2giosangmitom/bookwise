import { Controller, HttpCode, NotFoundException } from "@nestjs/common";
import { AuthorService } from "./author.service";
import { TypedBody, TypedParam, TypedRoute } from "@nestia/core";
import { CreateAuthorResponse, GetAuthorResponse, type CreateAuthorBody, type UpdateAuthorBody } from "./author.dto";
import { tags } from "typia";
import { ApiTags } from "@nestjs/swagger";
import { Auth } from "@/guards/auth";
import { Role } from "@bookwise/shared";

@Controller("/author")
@ApiTags("Author")
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @TypedRoute.Post()
  @Auth(Role.ADMIN, Role.LIBRARIAN)
  async createAuthor(@TypedBody() body: CreateAuthorBody): Promise<CreateAuthorResponse> {
    const createdAuthor = await this.authorService.create(body);

    return {
      message: "Author has been created successfully",
      data: { authorId: createdAuthor.id },
    };
  }

  @TypedRoute.Get("/:id")
  async getAuthor(@TypedParam("id") id: string & tags.Format<"uuid">): Promise<GetAuthorResponse> {
    const author = await this.authorService.findById(id);

    if (!author) {
      throw new NotFoundException("Author not found");
    }

    return {
      id: author.id,
      name: author.name,
      biography: author.biography,
      dateOfBirth: author.dateOfBirth.toISOString().split("T")[0] as string & tags.Format<"date">,
      dateOfDeath: author.dateOfDeath
        ? (author.dateOfDeath.toISOString().split("T")[0] as string & tags.Format<"date">)
        : null,
      slug: author.slug,
      photoFileName: author.photoFileName,
      books: author.books.map((book) => ({
        id: book.id,
        title: book.title,
        isbn: book.isbn,
      })),
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
}
