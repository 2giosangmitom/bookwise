import { Controller } from "@nestjs/common";
import { PublisherService } from "./publisher.service";
import { TypedRoute, TypedBody, TypedParam } from "@nestia/core";
import { type CreatePublisherBody, CreatePublisherResponse, DeletePublisherResponse } from "./publisher.dto";

@Controller("/publisher")
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

  @TypedRoute.Delete("/:id")
  async deletePublisher(@TypedParam("id") id: string): Promise<DeletePublisherResponse> {
    const deletedPublisher = await this.publisherService.delete(id);

    return {
      message: "Publisher has been deleted successfully",
      data: {
        name: deletedPublisher.name,
        description: deletedPublisher.description,
        website: deletedPublisher.website,
        slug: deletedPublisher.slug,
        photoFileName: deletedPublisher.photoFileName,
      },
    };
  }
}
