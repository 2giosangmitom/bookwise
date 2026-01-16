import { Controller, HttpCode } from "@nestjs/common";
import { PublisherService } from "./publisher.service";
import { TypedRoute, TypedBody, TypedParam } from "@nestia/core";
import { type CreatePublisherBody, CreatePublisherResponse } from "./publisher.dto";
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

  @TypedRoute.Delete("/:id")
  @HttpCode(204)
  async deletePublisher(@TypedParam("id") id: string & tags.Format<"uuid">): Promise<void> {
    await this.publisherService.delete(id);
  }
}
