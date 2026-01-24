import { Controller, HttpCode, NotFoundException, Query } from "@nestjs/common";
import { PublisherService } from "./publisher.service";
import { TypedRoute, TypedBody, TypedParam } from "@nestia/core";
import {
  type CreatePublisherBody,
  CreatePublisherResponse,
  GetPublisherResponse,
  type UpdatePublisherBody,
  type GetPublishersResponse,
} from "./publisher.dto";
import { tags } from "typia";
import { ApiTags } from "@nestjs/swagger";
import { Auth } from "@/guards/auth";
import { Role } from "@bookwise/shared";

@Controller("/publisher")
@ApiTags("Publisher")
export class PublisherController {
  constructor(private readonly publisherService: PublisherService) {}

  @TypedRoute.Post()
  @Auth(Role.ADMIN, Role.LIBRARIAN)
  async createPublisher(@TypedBody() body: CreatePublisherBody): Promise<CreatePublisherResponse> {
    const createdPublisher = await this.publisherService.create(body);

    return {
      message: "Publisher has been created successfully",
      data: { publisherId: createdPublisher.id },
    };
  }

  @TypedRoute.Get("/:id")
  async getPublisher(@TypedParam("id") id: string & tags.Format<"uuid">): Promise<GetPublisherResponse> {
    const publisher = await this.publisherService.findById(id);

    if (!publisher) {
      throw new NotFoundException("Publisher not found");
    }

    return {
      id: publisher.id,
      name: publisher.name,
      description: publisher.description,
      website: publisher.website,
      slug: publisher.slug,
      photoFileName: publisher.photoFileName,
      books: publisher.books.map((book) => ({
        id: book.id,
        title: book.title,
        isbn: book.isbn,
      })),
    };
  }

  @TypedRoute.Patch("/:id")
  @HttpCode(204)
  @Auth(Role.ADMIN, Role.LIBRARIAN)
  async updatePublisher(
    @TypedParam("id") id: string & tags.Format<"uuid">,
    @TypedBody() body: UpdatePublisherBody,
  ): Promise<void> {
    await this.publisherService.update(id, body);
  }

  @TypedRoute.Delete("/:id")
  @HttpCode(204)
  @Auth(Role.ADMIN, Role.LIBRARIAN)
  async deletePublisher(@TypedParam("id") id: string & tags.Format<"uuid">): Promise<void> {
    await this.publisherService.delete(id);
  }

  @TypedRoute.Get("/")
  async getAllPublishers(
    @Query("search") search?: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ): Promise<GetPublishersResponse> {
    const [publishers, total] = await this.publisherService.search({ page, limit, search }, [
      "id",
      "name",
      "description",
      "website",
      "slug",
      "photoFileName",
    ]);

    return {
      message: "Publishers fetched successfully",
      meta: { total },
      data: publishers.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        website: p.website,
        slug: p.slug,
        photoFileName: p.photoFileName,
      })),
    };
  }
}
