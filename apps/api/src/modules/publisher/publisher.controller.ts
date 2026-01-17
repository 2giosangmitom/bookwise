import { Controller, HttpCode, NotFoundException } from "@nestjs/common";
import { PublisherService } from "./publisher.service";
import { TypedRoute, TypedBody, TypedParam } from "@nestia/core";
import {
  type CreatePublisherBody,
  CreatePublisherResponse,
  GetPublisherResponse,
  type UpdatePublisherBody,
} from "./publisher.dto";
import { tags } from "typia";
import { ApiTags } from "@nestjs/swagger";

@Controller("/publisher")
@ApiTags("Publisher")
export class PublisherController {
  constructor(private readonly publisherService: PublisherService) {}

  @TypedRoute.Post()
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
  async updatePublisher(
    @TypedParam("id") id: string & tags.Format<"uuid">,
    @TypedBody() body: UpdatePublisherBody,
  ): Promise<void> {
    await this.publisherService.update(id, body);
  }

  @TypedRoute.Delete("/:id")
  @HttpCode(204)
  async deletePublisher(@TypedParam("id") id: string & tags.Format<"uuid">): Promise<void> {
    await this.publisherService.delete(id);
  }
}
