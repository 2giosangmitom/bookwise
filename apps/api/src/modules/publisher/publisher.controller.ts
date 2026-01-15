import { Body, Controller, Delete, Param, ParseUUIDPipe, Post, UsePipes } from "@nestjs/common";
import { PublisherService } from "./publisher.service";
import {
  type createPublisherDTO,
  createPublisherSchema,
  type CreatePublisherResponse,
  type DeletePublisherResponse,
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
  CreatePublisherBodyJsonSchema,
  CreatePublisherResponseJsonSchema,
  DeletePublisherResponseJsonSchema,
} from "@/constants";

@Controller("/publisher")
export class PublisherController {
  constructor(private readonly publisherService: PublisherService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createPublisherSchema))
  @ApiBody({ schema: CreatePublisherBodyJsonSchema })
  @ApiCreatedResponse({
    schema: CreatePublisherResponseJsonSchema,
    description: "Publisher has been created successfully",
  })
  @ApiConflictResponse({ schema: ApiErrorResponseJsonSchema, description: "Slug already in use" })
  @ApiBadRequestResponse({ schema: ApiErrorResponseJsonSchema, description: "Validation failed" })
  async createPublisher(@Body() body: createPublisherDTO): Promise<CreatePublisherResponse> {
    const createdPublisher = await this.publisherService.create(body);

    return {
      message: "Publisher has been created successfully",
      data: { publisherId: createdPublisher.id },
    };
  }

  @Delete("/:id")
  @ApiOkResponse({
    schema: DeletePublisherResponseJsonSchema,
    description: "Publisher has been deleted successfully",
  })
  @ApiNotFoundResponse({ schema: ApiErrorResponseJsonSchema, description: "Publisher not found" })
  async deletePublisher(@Param("id", ParseUUIDPipe) id: string): Promise<DeletePublisherResponse> {
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
